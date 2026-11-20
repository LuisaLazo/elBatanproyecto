package pe.edu.upeu.elBatan.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.elBatan.dto.DetalleResponseDTO;
import pe.edu.upeu.elBatan.dto.ItemVentaDTO;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.DetallePedido;
import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.entity.Pedido;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.entity.Producto;
import pe.edu.upeu.elBatan.exception.InsufficientStockException;
import pe.edu.upeu.elBatan.exception.ResourceNotFoundException;
import pe.edu.upeu.elBatan.repository.PedidoRepository;
import pe.edu.upeu.elBatan.repository.PersonaRepository;
import pe.edu.upeu.elBatan.repository.ProductoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements IPedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final PersonaRepository personaRepository;

    public PedidoServiceImpl(
            PedidoRepository pedidoRepository,
            ProductoRepository productoRepository,
            PersonaRepository personaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional
    public PedidoResponseDTO realizarPedido(Long idPersona, VentaDTO dto) {
        Persona persona = personaRepository.findById(idPersona)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        Pedido pedido = new Pedido();
        pedido.setPersona(persona);
        pedido.setEstado(Estado.EN_LOCAL);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setDireccion(dto.direccion());
        pedido.setReferencia(dto.referencia());
        pedido.setTelefonoEntrega(dto.telefonoEntrega());

        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal totalPedido = BigDecimal.ZERO;

        for (ItemVentaDTO item : dto.items()) {
            Producto producto = productoRepository.findById(item.idProducto())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto " + item.idProducto() + " no encontrado"));

            if (producto.getStock() < item.cantidad()) {
                throw new InsufficientStockException(
                        "Stock insuficiente de " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - item.cantidad());
            productoRepository.save(producto);

            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(item.cantidad()));

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

        return convertToDTO(pedidoRepository.save(pedido));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodo() {
        return pedidoRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorCliente(Long idPersona) {
        return pedidoRepository.findByPersonaIdPersona(idPersona).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PedidoResponseDTO> buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorEstado(Estado estado) {
        return pedidoRepository.findByEstado(estado.name()).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional
    public Optional<PedidoResponseDTO> actualizarEstado(Long id, String estado) {
        return pedidoRepository.findById(id).map(pedido -> {
            Estado nuevoEstado;

            try {
                nuevoEstado = Estado.valueOf(estado.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Estado de pedido no válido: " + estado);
            }

            pedido.setEstado(nuevoEstado);
            return convertToDTO(pedidoRepository.save(pedido));
        });
    }

    @Override
    public boolean eliminar(Long id) {
        if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private PedidoResponseDTO convertToDTO(Pedido pedido) {
        List<DetalleResponseDTO> productos = pedido.getDetalle().stream()
                .map(detalle -> {
                    Producto producto = detalle.getProducto();
                    String nombreProducto = producto == null
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

        return new PedidoResponseDTO(
                pedido.getIdPedido(),
                pedido.getPersona().getNombre(),
                pedido.getTotal(),
                pedido.getEstado().name(),
                pedido.getFechaPedido(),
                pedido.getDireccion(),
                pedido.getReferencia(),
                pedido.getTelefonoEntrega(),
                productos
        );
    }
}