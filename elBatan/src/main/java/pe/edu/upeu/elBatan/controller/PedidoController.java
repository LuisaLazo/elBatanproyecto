package pe.edu.upeu.elBatan.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.entity.Pedido;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.entity.Usuario;
import pe.edu.upeu.elBatan.repository.PedidoRepository;
import pe.edu.upeu.elBatan.repository.UsuarioRepository;
import pe.edu.upeu.elBatan.services.EvidenciaEntregaService;
import pe.edu.upeu.elBatan.services.IPedidoService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    private final IPedidoService pedidoService;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final EvidenciaEntregaService evidenciaEntregaService;

    public PedidoController(IPedidoService pedidoService, UsuarioRepository usuarioRepository, PedidoRepository pedidoRepository, EvidenciaEntregaService evidenciaEntregaService) {
        this.pedidoService = pedidoService;
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
        this.evidenciaEntregaService = evidenciaEntregaService;
    }



    @PostMapping
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @Valid @RequestBody VentaDTO dto, Principal principal) {
        Long idPersona = idPersonaAutenticada(principal);
        PedidoResponseDTO pedido = pedidoService.realizarPedido(idPersona, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/mios")
    public ResponseEntity<List<PedidoResponseDTO>> listarMisPedidos(Principal principal) {
        Long idPersona = idPersonaAutenticada(principal);
        return ResponseEntity.ok(pedidoService.listarPorCliente(idPersona));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarTodo() {
        return ResponseEntity.ok(pedidoService.listarTodo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoResponseDTO>> listarPorEstado(
            @PathVariable Estado estado) {
        return ResponseEntity.ok(pedidoService.listarPorEstado(estado));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponseDTO> actualizarEstado(
            @PathVariable Long id, @RequestParam String estado) {
        return pedidoService.actualizarEstado(id, estado)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (pedidoService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    private Long idPersonaAutenticada(Principal principal) {
        return usuarioRepository.findByUsuario(principal.getName())
                .map(Usuario::getPersona)
                .map(Persona::getIdPersona)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "La cuenta no tiene una persona asociada"));
    }


    @GetMapping(
            value = "/{id}/evidencia",
            produces = {
                    MediaType.IMAGE_JPEG_VALUE,
                    MediaType.IMAGE_PNG_VALUE
            }
    )
    public ResponseEntity<byte[]> visualizarEvidencia(
            @PathVariable Long id,
            Principal principal
    ) {

        // 1. Obtener usuario autenticado
        String username = obtenerUsername(principal);

        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuario no encontrado"
                        )
                );

        // 2. Buscar pedido
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pedido no encontrado"
                        )
                );

        // 3. Comprobar si es administrador
        boolean esAdmin = usuario.getRolesUsuario()
                .stream()
                .anyMatch(rolUsuario ->
                        rolUsuario.getRol() != null &&
                                "ADMIN".equalsIgnoreCase(
                                        rolUsuario.getRol().getName()
                                )
                );

        // 4. Comprobar si es repartidor asignado
        boolean esRepartidorAsignado =
                pedido.getRepartidor() != null &&
                        pedido.getRepartidor().getIdUsuario()
                                .equals(usuario.getIdUsuario());

        if (!esAdmin && !esRepartidorAsignado) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para ver esta evidencia"
            );
        }

        // 5. Verificar si existe evidencia
        if (pedido.getEvidenciaEntrega() == null ||
                pedido.getEvidenciaEntrega().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Este pedido no tiene evidencia de entrega"
            );
        }

        // 6. Recuperar fotografía
        String nombreArchivo = pedido.getEvidenciaEntrega();

        byte[] imagen = evidenciaEntregaService.obtener(nombreArchivo);

        // 7. Identificar tipo de imagen
        MediaType tipoImagen;

        if (nombreArchivo.toLowerCase().endsWith(".png")) {
            tipoImagen = MediaType.IMAGE_PNG;
        } else {
            tipoImagen = MediaType.IMAGE_JPEG;
        }

        // 8. Devolver fotografía
        return ResponseEntity.ok()
                .contentType(tipoImagen)
                .header(
                        HttpHeaders.CACHE_CONTROL,
                        "no-store"
                )
                .body(imagen);
    }

    private String obtenerUsername(Principal principal) {

        if (principal == null ||
                principal.getName() == null ||
                principal.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para realizar esta operación"
            );
        }

        return principal.getName();
    }


    // =========================================
    // REPARTIDOR: LISTAR PEDIDOS DISPONIBLES
    // =========================================

    @GetMapping("/disponibles")
    public ResponseEntity<List<PedidoResponseDTO>> listarDisponibles() {

        return ResponseEntity.ok(
                pedidoService.listarDisponibles()
        );
    }

    // =========================================
    // REPARTIDOR: LISTAR MIS ENTREGAS
    // =========================================

    @GetMapping("/mis-entregas")
    public ResponseEntity<List<PedidoResponseDTO>> listarMisEntregas(
            Principal principal
    ) {

        String username = obtenerUsername(principal);

        return ResponseEntity.ok(
                pedidoService.listarMisEntregas(username)
        );
    }

    // =========================================
    // REPARTIDOR: TOMAR UN PEDIDO
    // =========================================

    @PutMapping("/{id}/tomar")
    public ResponseEntity<PedidoResponseDTO> tomarPedido(
            @PathVariable Long id,
            Principal principal
    ) {

        String username = obtenerUsername(principal);

        PedidoResponseDTO pedido = pedidoService.tomarPedido(
                id,
                username
        );

        return ResponseEntity.ok(pedido);
    }

    // =========================================
    // REPARTIDOR: CONFIRMAR ENTREGA
    // =========================================

    @PostMapping(
            value = "/{id}/evidencia",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PedidoResponseDTO> confirmarEntrega(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            Principal principal
    ) {

        String username = obtenerUsername(principal);

        PedidoResponseDTO pedido = pedidoService.confirmarEntrega(
                id,
                username,
                archivo
        );

        return ResponseEntity.ok(pedido);
    }


}