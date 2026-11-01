package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.Estado;

import java.util.List;
import java.util.Optional;

public interface IPedidoService {
    PedidoResponseDTO realizarPedido (VentaDTO dto);
    List<PedidoResponseDTO> listarTodo();

    Optional<PedidoResponseDTO> buscarPorId(Long id);

    List<PedidoResponseDTO> listarPorEstado(Estado estado);
    Optional<PedidoResponseDTO> actualizarEstado(Long id, String estado);

    boolean eliminar(Long id);
}
