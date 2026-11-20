
package pe.edu.upeu.elBatan.services;

import org.springframework.stereotype.Service;
import pe.edu.upeu.elBatan.dto.ResumenVentasDTO;
import pe.edu.upeu.elBatan.repository.ResumenVentasRepository;
import pe.edu.upeu.elBatan.services.ResumenVentasService;

import java.time.LocalDate;

@Service
public class ResumenVentasServiceImpl
        implements ResumenVentasService {

    private final ResumenVentasRepository repository;

    public ResumenVentasServiceImpl(
            ResumenVentasRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public ResumenVentasDTO obtenerResumen(
            LocalDate inicio,
            LocalDate fin
    ) {
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException(
                    "La fecha inicial no puede ser posterior a la final"
            );
        }

        return repository.obtenerResumen(inicio, fin);
    }
}
