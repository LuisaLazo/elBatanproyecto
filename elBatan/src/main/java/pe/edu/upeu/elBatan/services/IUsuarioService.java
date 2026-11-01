package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.RegistroDTO;
import pe.edu.upeu.elBatan.dto.UsuarioDTO;

import java.util.Optional;


public interface IUsuarioService {
    Optional<UsuarioDTO> registrarCliente(RegistroDTO dto);

}
