
package pe.edu.upeu.elBatan.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.upeu.elBatan.dto.DetalleResponseDTO;
import pe.edu.upeu.elBatan.dto.ItemVentaDTO;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;

import pe.edu.upeu.elBatan.entity.DetallePedido;
import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.entity.Pedido;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.entity.Producto;
import pe.edu.upeu.elBatan.entity.Usuario;

import pe.edu.upeu.elBatan.exception.InsufficientStockException;
import pe.edu.upeu.elBatan.exception.ResourceNotFoundException;

import pe.edu.upeu.elBatan.repository.PedidoRepository;
import pe.edu.upeu.elBatan.repository.PersonaRepository;
import pe.edu.upeu.elBatan.repository.ProductoRepository;
import pe.edu.upeu.elBatan.repository.UsuarioRepository;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class PedidoServiceImpl implements IPedidoService {

    // =========================================
    // REPOSITORIOS Y SERVICIOS
    // =========================================

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaEntregaService evidenciaEntregaService;

    public PedidoServiceImpl(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository,
            EvidenciaEntregaService evidenciaEntregaService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.evidenciaEntregaService = evidenciaEntregaService;
    }

    // =========================================
    // 1. REALIZAR PEDIDO
    // =========================================

    @Override
    @Transactional
    public PedidoResponseDTO realizarPedido(
            Long idPersona,
            VentaDTO dto
    ) {

        Persona persona = personaRepository.findById(idPersona)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cliente no encontrado"
                        )
                );

        if (dto == null ||
                dto.items() == null ||
                dto.items().isEmpty()) {

            throw new IllegalArgumentException(
                    "El pedido debe contener productos"
            );
        }

        Pedido pedido = new Pedido();

        pedido.setPersona(persona);
        pedido.setEstado(Estado.EN_LOCAL);
        pedido.setFechaPedido(LocalDateTime.now());

        pedido.setDireccion(dto.direccion());
        pedido.setReferencia(dto.referencia());
        pedido.setTelefonoEntrega(dto.telefonoEntrega());

        // Código único de 32 caracteres
        String codigoPedido = UUID.randomUUID()
                .toString()
                .replace("-", "");

        pedido.setCodigoPedido(codigoPedido);

        // Inicialmente sin repartidor ni evidencia
        pedido.setRepartidor(null);
        pedido.setEvidenciaEntrega(null);

        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal totalPedido = BigDecimal.ZERO;

        for (ItemVentaDTO item : dto.items()) {

            if (item == null ||
                    item.idProducto() == null ||
                    item.cantidad() == null ||
                    item.cantidad() <= 0) {

                throw new IllegalArgumentException(
                        "Producto o cantidad no válida"
                );
            }

            Producto producto = productoRepository
                    .findById(item.idProducto())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Producto no encontrado: "
                                            + item.idProducto()
                            )
                    );

            if (producto.getStock() == null ||
                    producto.getStock() < item.cantidad()) {

                throw new InsufficientStockException(
                        "Stock insuficiente de "
                                + producto.getNombre()
                );
            }

            // Descontar stock
            producto.setStock(
                    producto.getStock() - item.cantidad()
            );

            productoRepository.save(producto);

            // Calcular subtotal
            BigDecimal subtotal = producto.getPrecio()
                    .multiply(
                            BigDecimal.valueOf(item.cantidad())
                    );

            DetallePedido detalle = new DetallePedido();

            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);

            detalles.add(detalle);

            totalPedido = totalPedido.add(subtotal);
        }

        pedido.setTotal(totalPedido);
        pedido.setDetalle(detalles);

        Pedido guardado = pedidoRepository.save(pedido);

        return convertToDTO(guardado);
    }

    // =========================================
    // 2. LISTAR TODOS LOS PEDIDOS
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodo() {

        return pedidoRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =========================================
    // 3. LISTAR PEDIDOS DE UN CLIENTE
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorCliente(
            Long idPersona
    ) {

        return pedidoRepository
                .findByPersonaIdPersona(idPersona)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =========================================
    // 4. BUSCAR PEDIDO POR ID
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public Optional<PedidoResponseDTO> buscarPorId(
            Long id
    ) {

        return pedidoRepository.findById(id)
                .map(this::convertToDTO);
    }

    // =========================================
    // 5. LISTAR PEDIDOS POR ESTADO
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorEstado(
            Estado estado
    ) {

        return pedidoRepository.findByEstado(estado)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =========================================
    // 6. ACTUALIZAR ESTADO
    // =========================================

    @Override
    @Transactional
    public Optional<PedidoResponseDTO> actualizarEstado(
            Long id,
            String estado
    ) {

        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar un estado"
            );
        }

        Estado nuevoEstado;

        try {
            nuevoEstado = Estado.valueOf(
                    estado.trim().toUpperCase(Locale.ROOT)
            );

        } catch (IllegalArgumentException ex) {

            throw new IllegalArgumentException(
                    "Estado de pedido no válido: " + estado
            );
        }

        return pedidoRepository.findById(id)
                .map(pedido -> {

                    // Las entregas se confirman con fotografía
                    if (nuevoEstado == Estado.RECIBIDO) {

                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Debes confirmar la entrega con fotografía"
                        );
                    }

                    // No modificar pedidos ya asignados
                    if (pedido.getRepartidor() != null) {

                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "El pedido ya tiene un repartidor asignado"
                        );
                    }

                    // No modificar pedidos finalizados
                    if (pedido.getEstado() == Estado.RECIBIDO ||
                            pedido.getEstado() == Estado.CANCELADO) {

                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "No se puede modificar un pedido finalizado"
                        );
                    }

                    // EN_CAMINO requiere un repartidor
                    if (nuevoEstado == Estado.EN_CAMINO) {

                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Un repartidor debe tomar el pedido"
                        );
                    }

                    pedido.setEstado(nuevoEstado);

                    return convertToDTO(
                            pedidoRepository.save(pedido)
                    );
                });
    }

    // =========================================
    // 7. ELIMINAR PEDIDO
    // =========================================

    @Override
    @Transactional
    public boolean eliminar(Long id) {

        Optional<Pedido> pedidoOptional =
                pedidoRepository.findById(id);

        if (pedidoOptional.isEmpty()) {
            return false;
        }

        Pedido pedido = pedidoOptional.get();

        if (pedido.getRepartidor() != null ||
                pedido.getEstado() == Estado.RECIBIDO) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un pedido asignado o entregado"
            );
        }

        pedidoRepository.delete(pedido);

        return true;
    }

    // =========================================
    // 8. LISTAR PEDIDOS DISPONIBLES
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarDisponibles() {

        return pedidoRepository
                .findByEstadoAndRepartidorIsNull(
                        Estado.EN_LOCAL
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =========================================
    // 9. LISTAR MIS ENTREGAS
    // =========================================

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarMisEntregas(
            String username
    ) {

        Usuario repartidor = obtenerRepartidor(username);

        return pedidoRepository
                .findByRepartidorIdUsuario(
                        repartidor.getIdUsuario()
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // =========================================
    // 10. TOMAR UN PEDIDO
    // =========================================

    @Override
    @Transactional
    public PedidoResponseDTO tomarPedido(
            Long idPedido,
            String username
    ) {

        Usuario repartidor = obtenerRepartidor(username);

        int filasActualizadas =
                pedidoRepository.asignarRepartidor(
                        idPedido,
                        repartidor.getIdUsuario()
                );

        if (filasActualizadas == 0) {

            if (!pedidoRepository.existsById(idPedido)) {

                throw new ResourceNotFoundException(
                        "El pedido no existe"
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido ya fue tomado o no está disponible"
            );
        }

        Pedido pedido = pedidoRepository.findById(idPedido)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pedido no encontrado"
                        )
                );

        return convertToDTO(pedido);
    }



    // =========================================
    // 11. CONFIRMAR ENTREGA CON FOTOGRAFÍA
    // =========================================

    @Override
    @Transactional
    public PedidoResponseDTO confirmarEntrega(
            Long idPedido,
            String username,
            MultipartFile archivo
    ) {

        Usuario repartidor = obtenerRepartidor(username);

        // Bloquear el pedido durante la confirmación
        Pedido pedido = pedidoRepository
                .buscarParaEntrega(idPedido)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Pedido no encontrado"
                        )
                );

        // Verificar que pertenezca al repartidor
        if (pedido.getRepartidor() == null ||
                !pedido.getRepartidor()
                        .getIdUsuario()
                        .equals(repartidor.getIdUsuario())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Este pedido no está asignado a tu cuenta"
            );
        }

        // Solo pedidos EN_CAMINO
        if (pedido.getEstado() != Estado.EN_CAMINO) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido no está en camino"
            );
        }

        // No permitir doble confirmación
        if (pedido.getEvidenciaEntrega() != null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido ya tiene evidencia"
            );
        }

        // Guardar la fotografía
        String nombreArchivo =
                evidenciaEntregaService.guardar(archivo);

        try {

            pedido.setEvidenciaEntrega(nombreArchivo);
            pedido.setEstado(Estado.RECIBIDO);

            Pedido guardado =
                    pedidoRepository.saveAndFlush(pedido);

            return convertToDTO(guardado);

        } catch (RuntimeException ex) {

            // Si falla el guardado, limpiar el archivo
            try {
                evidenciaEntregaService.eliminar(nombreArchivo);
            } catch (RuntimeException limpiezaEx) {
                ex.addSuppressed(limpiezaEx);
            }

            throw ex;
        }
    }

    // =========================================
    // 12. OBTENER REPARTIDOR AUTENTICADO
    // =========================================

    private Usuario obtenerRepartidor(
            String username
    ) {

        if (username == null || username.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión"
            );
        }

        Usuario usuario = usuarioRepository
                .findByUsuario(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario no encontrado"
                        )
                );

        boolean esRepartidor = usuario.getRolesUsuario()
                .stream()
                .anyMatch(rolUsuario ->

                        rolUsuario.getRol() != null &&

                                "REPARTIDOR".equalsIgnoreCase(
                                        rolUsuario.getRol().getName()
                                )
                );

        if (!esRepartidor) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos de repartidor"
            );
        }

        return usuario;
    }

    // =========================================
    // 13. CONVERTIR PEDIDO A DTO
    // =========================================

    private PedidoResponseDTO convertToDTO(
            Pedido pedido
    ) {

        List<DetalleResponseDTO> productos =
                pedido.getDetalle()
                        .stream()
                        .map(detalle -> {

                            Producto producto =
                                    detalle.getProducto();

                            String nombreProducto =
                                    producto == null
                                            ? "Producto no disponible"
                                            : producto.getNombre();

                            return new DetalleResponseDTO(
                                    nombreProducto,
                                    detalle.getCantidad(),
                                    detalle.getPrecioUnitario(),
                                    detalle.getSubtotal()
                            );
                        })
                        .toList();

        // Datos del repartidor
        Long idRepartidor = null;
        String nombreRepartidor = null;

        if (pedido.getRepartidor() != null) {

            Usuario repartidor = pedido.getRepartidor();

            idRepartidor = repartidor.getIdUsuario();

            if (repartidor.getPersona() != null) {

                nombreRepartidor =
                        repartidor.getPersona().getNombre();

            } else {

                nombreRepartidor =
                        repartidor.getUsuario();
            }
        }

        return new PedidoResponseDTO(
                pedido.getIdPedido(),
                pedido.getPersona().getNombre(),
                pedido.getTotal(),
                pedido.getEstado().name(),
                pedido.getFechaPedido(),
                pedido.getDireccion(),
                pedido.getReferencia(),
                pedido.getTelefonoEntrega(),
                productos,

                // Campos nuevos
                pedido.getCodigoPedido(),
                idRepartidor,
                nombreRepartidor,
                pedido.getEvidenciaEntrega()
        );
    }

}
