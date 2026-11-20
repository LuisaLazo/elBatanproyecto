package pe.edu.upeu.elBatan.dto;

public record ReporteUsuarioDTO(
        Long idUsuario,
        String nombre,
        String usuario,
        Long idRol,
        String rol
) {}