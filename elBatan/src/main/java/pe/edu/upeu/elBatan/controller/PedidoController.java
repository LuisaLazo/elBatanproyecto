package pe.edu.upeu.elBatan.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.entity.Usuario;
import pe.edu.upeu.elBatan.repository.UsuarioRepository;
import pe.edu.upeu.elBatan.services.IPedidoService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidoController {

    private final IPedidoService pedidoService;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(
            IPedidoService pedidoService,
            UsuarioRepository usuarioRepository) {
        this.pedidoService = pedidoService;
        this.usuarioRepository = usuarioRepository;
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
}