package pe.edu.upeu.elBatan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record VentaDTO(

        @NotNull
        Long idPersona,
        @NotBlank(message = "La dirección de envío es obligatoria")
        String direccion,
        @NotEmpty
        List<ItemVentaDTO> items


) {
}
