package pe.edu.upeu.elBatan.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upeu.elBatan.Security.JwtService;
import pe.edu.upeu.elBatan.Security.UsuarioPrincipal;
import pe.edu.upeu.elBatan.dto.RegistroDTO;
import pe.edu.upeu.elBatan.dto.UsuarioDTO;
import pe.edu.upeu.elBatan.entity.AuthResponse;
import pe.edu.upeu.elBatan.entity.LoginRequest;
import pe.edu.upeu.elBatan.entity.Usuario;
import pe.edu.upeu.elBatan.repository.UsuarioRepository;
import pe.edu.upeu.elBatan.services.IUsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final IUsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(IUsuarioService usuarioService, AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> register(@Valid @RequestBody RegistroDTO dto){
        return usuarioService.registrarCliente(dto)
                .map(user -> new ResponseEntity<>(user, HttpStatus.CREATED))
                .orElseThrow(()-> new RuntimeException("El email o nombre del usuario ya esta en uso"));

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usuario(), request.password())
        );

        Usuario user = usuarioRepository.findByUsuario(request.usuario()).orElseThrow();
        UsuarioPrincipal principal = new UsuarioPrincipal(user);
        String jwtToken = jwtService.generateToken(principal);

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(new AuthResponse(
                jwtToken,
                user.getUsuario(),
                roles,
                user.getPersona().getIdPersona()
        ));
    }
}