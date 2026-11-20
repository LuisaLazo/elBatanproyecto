package pe.edu.upeu.elBatan.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(unique = true, nullable = false)
    private String usuario;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "usuario")
    private List<RolUsuario> rolesUsuario = new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "id_persona")
    private Persona persona;

    public Usuario() {
    }

    public Usuario(Long idUsuario, String usuario, String password, List<RolUsuario> rolesUsuario, Persona persona) {
        this.idUsuario = idUsuario;
        this.usuario = usuario;
        this.password = password;
        this.rolesUsuario = rolesUsuario;
        this.persona = persona;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<RolUsuario> getRolesUsuario() {
        return rolesUsuario;
    }

    public void setRolesUsuario(List<RolUsuario> rolesUsuario) {
        this.rolesUsuario = rolesUsuario;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }
}