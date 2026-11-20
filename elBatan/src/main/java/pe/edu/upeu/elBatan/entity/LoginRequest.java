package pe.edu.upeu.elBatan.entity;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El user es obligatorio")
        String usuario,
        @NotBlank(message = "la clave es obligatorio")
        String password
) {
}
