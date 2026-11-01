package pe.edu.upeu.elBatan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponseDTO(

        Long idPedido,
        String cliente,
        BigDecimal total,
        String estado,
        LocalDateTime fecha,
        String direccion,
        List<DetalleResponseDTO> productos

) {
}
