package pe.edu.upeu.elBatan.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;
    @ManyToOne
    @JoinColumn(name = "id_persona")
    private Persona persona;
    private BigDecimal total;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Estado estado;
    @Column(name = "fecha_pedido")
    private LocalDateTime fechaPedido;
    @Column(name = "direccion", length = 100)
    private String direccion;

    @OneToMany(mappedBy = "pedido",cascade =CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalle = new ArrayList<>();

    public Pedido() {
    }

    public Pedido(Long idPedido, Persona persona, BigDecimal total, Estado estado, LocalDateTime fechaPedido, String direccion, List<DetallePedido> detalle) {
        this.idPedido = idPedido;
        this.persona = persona;
        this.total = total;
        this.estado = estado;
        this.fechaPedido = fechaPedido;
        this.direccion = direccion;
        this.detalle = detalle;
    }

    public Long getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Long idPedido) {
        this.idPedido = idPedido;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public List<DetallePedido> getDetalle() {
        return detalle;
    }

    public void setDetalle(List<DetallePedido> detalle) {
        this.detalle = detalle;
    }
}
