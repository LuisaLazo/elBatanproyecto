package pe.edu.upeu.elBatan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rolUsuario")
public class RolUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idRU")
    private Long idRU;

    @ManyToOne
    @JoinColumn(name = "idRol")
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "idUsuario")
    private Usuario usuario;

    public RolUsuario() {
    }

    public RolUsuario(Long idRU, Rol rol, Usuario usuario) {
        this.idRU = idRU;
        this.rol = rol;
        this.usuario = usuario;
    }

    public Long getIdRU() {
        return idRU;
    }

    public void setIdRU(Long idRU) {
        this.idRU = idRU;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}