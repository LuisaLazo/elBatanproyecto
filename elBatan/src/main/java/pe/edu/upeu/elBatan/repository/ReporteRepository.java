
package pe.edu.upeu.elBatan.repository;

import pe.edu.upeu.elBatan.dto.ReporteVentaDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReporteRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReporteRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ReporteVentaDTO> listarVentas() {

        String sql = """
            SELECT
                ID_PEDIDO,
                CLIENTE,
                FECHA,
                ESTADO,
                DIRECCION,
                PRODUCTO,
                CANTIDAD,
                PRECIO_UNITARIO,
                SUBTOTAL
            FROM V_REPORTE_VENTAS
            ORDER BY FECHA DESC, ID_PEDIDO DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new ReporteVentaDTO(
                        rs.getLong("ID_PEDIDO"),
                        rs.getString("CLIENTE"),
                        rs.getTimestamp("FECHA").toLocalDateTime(),
                        rs.getString("ESTADO"),
                        rs.getString("DIRECCION"),
                        rs.getString("PRODUCTO"),
                        rs.getInt("CANTIDAD"),
                        rs.getBigDecimal("PRECIO_UNITARIO"),
                        rs.getBigDecimal("SUBTOTAL")
                )
        );
    }
}
