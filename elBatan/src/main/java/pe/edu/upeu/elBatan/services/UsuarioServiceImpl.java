package pe.edu.upeu.elBatan.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.elBatan.dto.RegistroDTO;
import pe.edu.upeu.elBatan.dto.UsuarioDTO;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.entity.Rol;
import pe.edu.upeu.elBatan.entity.RolUsuario;
import pe.edu.upeu.elBatan.entity.Usuario;
import pe.edu.upeu.elBatan.exception.DuplicateResourceException;
import pe.edu.upeu.elBatan.repository.PersonaRepository;
import pe.edu.upeu.elBatan.repository.RolRepository;
import pe.edu.upeu.elBatan.repository.RolUsuarioRepository;
import pe.edu.upeu.elBatan.repository.UsuarioRepository;

import java.util.Optional;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final RolUsuarioRepository rolUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(
            PersonaRepository personaRepository,
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            RolUsuarioRepository rolUsuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Optional<UsuarioDTO> registrarCliente(RegistroDTO dto) {
        // Validar que el correo sea único
        if (personaRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException(
                    "El email '" + dto.email() + "' ya está registrado");
        }

        // Validar que el usuario sea único
        if (usuarioRepository.existsByUsuario(dto.usuario())) {
            throw new DuplicateResourceException(
                    "El nombre del usuario '" + dto.usuario() + "' ya existe");
        }

        Persona p = new Persona();
        p.setNombre(dto.nombre());
        p.setEmail(dto.email());
        p.setTelefono(dto.telefono());
        p.setDireccion(dto.direccion());
        Persona personaGuardada = personaRepository.save(p);

        Usuario u = new Usuario();
        u.setUsuario(dto.usuario());
        u.setPassword(passwordEncoder.encode(dto.password()));
        u.setPersona(personaGuardada);
        Usuario usuarioGuardado = usuarioRepository.save(u);

        Rol rolCliente = rolRepository.findByName("CLIENTE")
                .orElseThrow(() -> new RuntimeException("El rol CLIENTE no existe"));

        RolUsuario rolUsuario = new RolUsuario();
        rolUsuario.setUsuario(usuarioGuardado);
        rolUsuario.setRol(rolCliente);
        rolUsuarioRepository.save(rolUsuario);

        return Optional.of(new UsuarioDTO(
                usuarioGuardado.getIdUsuario(),
                usuarioGuardado.getUsuario(),
                rolCliente.getName(),
                usuarioGuardado.getPersona().getNombre(),
                usuarioGuardado.getPersona().getEmail()
        ));
    }
}