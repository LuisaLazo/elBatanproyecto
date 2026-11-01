package pe.edu.upeu.elBatan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ItemVentaDTO(

        @NotNull
        Long idProducto,
        @Min(1)
        Integer cantidad

) {
}
