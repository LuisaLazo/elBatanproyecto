package pe.edu.upeu.elBatan.dto;

import java.math.BigDecimal;

public record DetalleResponseDTO(

        String producto,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {
}
