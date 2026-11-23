package pe.edu.upeu.elBatan.Security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pe.edu.upeu.elBatan.entity.Usuario;

import java.util.Collection;


public record UsuarioPrincipal(Usuario usuario) implements UserDetails {
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return usuario.getRolesUsuario().stream()
                .map(rolUsuario -> rolUsuario.getRol().getName())
                .map(SimpleGrantedAuthority::new)
                .toList();
    }

    // MÉTODOS DE USUARIOS GENERALES
    @Override
    public String getPassword() {
        return usuario.getPassword();
    }

    @Override
    public String getUsername() {
        return usuario.getUsuario();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
