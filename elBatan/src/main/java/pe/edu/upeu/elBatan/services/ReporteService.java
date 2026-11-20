package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.ReporteVentaDTO;
import pe.edu.upeu.elBatan.repository.ReporteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReporteService {

    private final ReporteRepository reporteRepository;

    public ReporteService(ReporteRepository reporteRepository) {
        this.reporteRepository = reporteRepository;
    }

    public List<ReporteVentaDTO> listarVentas() {
        return reporteRepository.listarVentas();
    }
}