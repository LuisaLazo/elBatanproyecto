package pe.edu.upeu.elBatan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReporteVentaDTO(
        Long idPedido,
        String cliente,
        LocalDateTime fechaPedido,
        String estado,
        String direccion,
        String producto,
        Integer cantidad,
        BigDecimal precio,
        BigDecimal subtotal
) {
}
