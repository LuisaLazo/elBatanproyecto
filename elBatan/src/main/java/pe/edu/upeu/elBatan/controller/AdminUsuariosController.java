
package pe.edu.upeu.elBatan.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
public class AdminUsuariosController {

    private final JdbcTemplate jdbc;

    public AdminUsuariosController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record CambioRolRequest(String rol) {}

    @PutMapping("/{id}/rol")
    @Transactional
    public Map<String, Object> cambiarRol(
            @PathVariable Long id,
            @RequestBody CambioRolRequest request,
            Principal principal) {

        if (request == null || request.rol() == null ||
                (!request.rol().equals("REPARTIDOR")
                        && !request.rol().equals("CLIENTE"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permite CLIENTE o REPARTIDOR"
            );
        }

        var usuarios = jdbc.queryForList(
                """
                SELECT USUARIO
                FROM ELBATANLP2.USUARIO
                WHERE ID_USUARIO = ?
                FOR UPDATE
                """,
                id
        );

        if (usuarios.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Usuario no encontrado"
            );
        }

        String nombreUsuario =
                String.valueOf(usuarios.get(0).get("USUARIO"));

        if (principal != null &&
                nombreUsuario.equalsIgnoreCase(principal.getName())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No puedes modificar tu propio rol"
            );
        }

        Integer administradores = jdbc.queryForObject(
                """
                SELECT COUNT(*)
                FROM ELBATANLP2.ROL_USUARIO RU
                JOIN ELBATANLP2.ROL R
                  ON R.ID_ROL = RU.ID_ROL
                WHERE RU.ID_USUARIO = ?
                  AND R.NAME = 'ADMIN'
                """,
                Integer.class,
                id
        );

        if (administradores != null && administradores > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede modificar un administrador"
            );
        }

        var roles = jdbc.queryForList(
                """
                SELECT ID_ROL
                FROM ELBATANLP2.ROL
                WHERE NAME = ?
                """,
                request.rol()
        );

        if (roles.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El rol solicitado no existe"
            );
        }

        long idRol = ((Number)
                roles.get(0).get("ID_ROL")).longValue();

        jdbc.update(
                """
                DELETE FROM ELBATANLP2.ROL_USUARIO
                WHERE ID_USUARIO = ?
                """,
                id
        );

        jdbc.update(
                """
                INSERT INTO ELBATANLP2.ROL_USUARIO
                    (ID_ROL, ID_USUARIO)
                VALUES (?, ?)
                """,
                idRol,
                id
        );

        return Map.of(
                "idUsuario", id,
                "usuario", nombreUsuario,
                "rol", request.rol()
        );
    }
}
