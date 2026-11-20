package pe.edu.upeu.elBatan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record VentaDTO(
        @NotBlank(message = "Ingresa la dirección de entrega")
        @Size(max = 100, message = "La dirección admite hasta 100 caracteres")
        String direccion,

        @Size(max = 150, message = "La referencia admite hasta 150 caracteres")
        String referencia,

        @NotBlank(message = "Ingresa un teléfono de contacto")
        @Pattern(regexp = "[0-9]{9}", message = "El teléfono debe tener 9 dígitos")
        String telefonoEntrega,

        @NotEmpty(message = "Agrega al menos un producto al pedido")
        List<@NotNull @Valid ItemVentaDTO> items
) {
}
