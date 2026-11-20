
package pe.edu.upeu.elBatan.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.elBatan.dto.ReporteUsuarioDTO;

import java.util.List;

@Repository
public class ReporteUsuarioRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReporteUsuarioRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ReporteUsuarioDTO> listar() {

        String sql = """
            SELECT
                ID_USUARIO,
                NOMBRE,
                USUARIO,
                ID_ROL,
                ROL
            FROM V_REPORTE_USUARIOS
            ORDER BY ID_USUARIO
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new ReporteUsuarioDTO(
                        rs.getLong("ID_USUARIO"),
                        rs.getString("NOMBRE"),
                        rs.getString("USUARIO"),
                        rs.getLong("ID_ROL"),
                        rs.getString("ROL")
                )
        );
    }
}
