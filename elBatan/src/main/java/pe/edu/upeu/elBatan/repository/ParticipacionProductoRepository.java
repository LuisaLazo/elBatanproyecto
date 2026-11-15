package pe.edu.upeu.elBatan.repository;


import pe.edu.upeu.elBatan.dto.ParticipacionProductoDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ParticipacionProductoRepository {

    private final JdbcTemplate jdbcTemplate;

    public ParticipacionProductoRepository(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ParticipacionProductoDTO> listar() {

        String sql = """
            SELECT
                ID_PRODUCTO,
                PRODUCTO,
                PRECIO,
                STOCK_ACTUAL,
                PEDIDOS_REALIZADOS,
                UNIDADES_VENDIDAS,
                INGRESOS_GENERADOS,
                PORCENTAJE_PARTICIPACION
            FROM V_PARTICIPACION_PRODUCTOS
            ORDER BY PORCENTAJE_PARTICIPACION DESC
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new ParticipacionProductoDTO(
                        rs.getLong("ID_PRODUCTO"),
                        rs.getString("PRODUCTO"),
                        rs.getBigDecimal("PRECIO"),
                        rs.getInt("STOCK_ACTUAL"),
                        rs.getLong("PEDIDOS_REALIZADOS"),
                        rs.getLong("UNIDADES_VENDIDAS"),
                        rs.getBigDecimal("INGRESOS_GENERADOS"),
                        rs.getBigDecimal("PORCENTAJE_PARTICIPACION")
                )
        );
    }
}
