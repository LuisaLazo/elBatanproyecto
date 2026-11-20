
package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.ResumenVentasDTO;
import java.time.LocalDate;

public interface ResumenVentasService {

    ResumenVentasDTO obtenerResumen(
            LocalDate inicio,
            LocalDate fin
    );
}