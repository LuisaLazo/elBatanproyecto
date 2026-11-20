
package pe.edu.upeu.elBatan.dto;

import java.math.BigDecimal;

public record ResumenVentasDTO(
        BigDecimal total,
        Integer cantidad
) {
}