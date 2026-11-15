package pe.edu.upeu.elBatan.dto;


import java.math.BigDecimal;

public record ParticipacionProductoDTO(
        Long idProducto,
        String producto,
        BigDecimal precio,
        Integer stockActual,
        Long pedidosRealizados,
        Long unidadesVendidas,
        BigDecimal ingresosGenerados,
        BigDecimal porcentajeParticipacion
) {}