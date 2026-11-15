
package pe.edu.upeu.elBatan.services;

import org.springframework.stereotype.Service;
import pe.edu.upeu.elBatan.dto.ReporteUsuarioDTO;
import pe.edu.upeu.elBatan.repository.ReporteUsuarioRepository;


import java.util.List;

@Service
public class ReporteUsuarioServiceImpl implements ReporteUsuarioService {

    private final ReporteUsuarioRepository repository;

    public ReporteUsuarioServiceImpl(
            ReporteUsuarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ReporteUsuarioDTO> listar() {
        return repository.listar();
    }
}
