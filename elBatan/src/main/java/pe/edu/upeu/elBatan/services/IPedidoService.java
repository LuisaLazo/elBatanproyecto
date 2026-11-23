
package pe.edu.upeu.elBatan.services;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.Estado;
import jakarta.persistence.LockModeType;
import pe.edu.upeu.elBatan.entity.Pedido;

import java.util.Optional;

import java.util.List;
import java.util.Optional;

public interface IPedidoService {

    PedidoResponseDTO realizarPedido(Long idPersona, VentaDTO dto);

    List<PedidoResponseDTO> listarTodo();

    List<PedidoResponseDTO> listarPorCliente(Long idPersona);

    Optional<PedidoResponseDTO> buscarPorId(Long id);

    List<PedidoResponseDTO> listarPorEstado(Estado estado);

    Optional<PedidoResponseDTO> actualizarEstado(Long id, String estado);

    boolean eliminar(Long id);


    List<PedidoResponseDTO> listarDisponibles();

    List<PedidoResponseDTO> listarMisEntregas(String username);

    PedidoResponseDTO tomarPedido(Long idPedido, String username);


    PedidoResponseDTO confirmarEntrega(
            Long idPedido,
            String username,
            MultipartFile archivo
    );

}
