package pe.edu.upeu.elBatan.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PersonaDto {

    public record Request(
            @NotBlank(message = "El DNI es obligatorio")
            @Pattern(regexp = "\\d{8}", message = "El DNI debe contener exactamente 8 dígitos numéricos")
            String dni
    ) {}

    public record Response(
            String dni,
            String nombre,
            String apellidos
    ) {}

    public record FactilizaResponse(
            boolean success,
            FactilizaData data,
            String message
    ) {}

    public record FactilizaData(
            @JsonProperty("numero")
            @JsonAlias({"dni", "number"})
            String dni,

            @JsonProperty("nombres")
            @JsonAlias({"name", "first_name"})
            String nombres,

            @JsonProperty("apellido_paterno")
            @JsonAlias({"apellidoPaterno", "paterno", "last_name"})
            String apellidoPaterno,

            @JsonProperty("apellido_materno")
            @JsonAlias({"apellidoMaterno", "materno"})
            String apellidoMaterno
    ) {}
}