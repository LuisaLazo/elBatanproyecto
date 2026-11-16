package pe.edu.upeu.elBatan.entity;

import java.util.List;

public record AuthResponse(
        String token,
        String usuario,
        List<String> roles,
        Long idPersona
) {
}
