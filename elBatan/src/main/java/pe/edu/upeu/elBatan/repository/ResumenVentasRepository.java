package pe.edu.upeu.elBatan.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.elBatan.dto.ResumenVentasDTO;

import java.sql.Date;
import java.sql.Types;
import java.time.LocalDate;

@Repository
public class ResumenVentasRepository {

    private final JdbcTemplate jdbcTemplate;

    public ResumenVentasRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public ResumenVentasDTO obtenerResumen(
            LocalDate inicio,
            LocalDate fin
    ) {
        return jdbcTemplate.execute(
                "{call SP_RESUMEN_VENTAS(?, ?, ?, ?)}",
                (java.sql.CallableStatement cs) -> {

                    cs.setDate(1, Date.valueOf(inicio));
                    cs.setDate(2, Date.valueOf(fin));

                    cs.registerOutParameter(3, Types.NUMERIC);
                    cs.registerOutParameter(4, Types.NUMERIC);

                    cs.execute();

                    return new ResumenVentasDTO(
                            cs.getBigDecimal(3),
                            cs.getInt(4)
                    );
                }
        );
    }
}