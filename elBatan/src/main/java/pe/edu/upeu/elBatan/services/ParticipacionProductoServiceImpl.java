
package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.ParticipacionProductoDTO;
import pe.edu.upeu.elBatan.repository.ParticipacionProductoRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ParticipacionProductoServiceImpl implements ParticipacionProductoService {

    private final ParticipacionProductoRepository repository;

    public ParticipacionProductoServiceImpl(
            ParticipacionProductoRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ParticipacionProductoDTO> listar() {
        return repository.listar();
    }
}
