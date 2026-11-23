
package pe.edu.upeu.elBatan.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PEDIDO")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PEDIDO")
    private Long idPedido;

    // Cliente que realiza el pedido
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PERSONA")
    private Persona persona;

    // Estado actual del pedido
    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private Estado estado;

    // Fecha en que se realiza el pedido
    @Column(name = "FECHA_PEDIDO")
    private LocalDateTime fechaPedido;

    // Total del pedido
    @Column(name = "TOTAL", precision = 38, scale = 2)
    private BigDecimal total;

    // Dirección de entrega
    @Column(name = "DIRECCION", length = 100)
    private String direccion;

    // Referencia de la dirección
    @Column(name = "REFERENCIA", length = 150)
    private String referencia;

    // Teléfono para la entrega
    @Column(name = "TELEFONO_ENTREGA", length = 9)
    private String telefonoEntrega;

    // Código único del pedido
    @Column(name = "CODIGO_PEDIDO", length = 32,
            nullable = false, unique = true)
    private String codigoPedido;

    // Repartidor que toma el pedido
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_REPARTIDOR")
    private Usuario repartidor;

    // Ruta de la fotografía de entrega
    @Column(name = "EVIDENCIA_ENTREGA", length = 255)
    private String evidenciaEntrega;

    // Productos incluidos en el pedido
    @OneToMany(
            mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DetallePedido> detalle = new ArrayList<>();

    // Constructor vacío obligatorio para JPA
    public Pedido() {
    }

    // Constructor compatible con el código anterior
    public Pedido(
            Long idPedido,
            Persona persona,
            BigDecimal total,
            Estado estado,
            LocalDateTime fechaPedido,
            String direccion,
            List<DetallePedido> detalle
    ) {
        this.idPedido = idPedido;
        this.persona = persona;
        this.total = total;
        this.estado = estado;
        this.fechaPedido = fechaPedido;
        this.direccion = direccion;
        this.detalle = detalle;
    }

    // GETTERS Y SETTERS

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

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getTelefonoEntrega() {
        return telefonoEntrega;
    }

    public void setTelefonoEntrega(String telefonoEntrega) {
        this.telefonoEntrega = telefonoEntrega;
    }

    public String getCodigoPedido() {
        return codigoPedido;
    }

    public void setCodigoPedido(String codigoPedido) {
        this.codigoPedido = codigoPedido;
    }

    public Usuario getRepartidor() {
        return repartidor;
    }

    public void setRepartidor(Usuario repartidor) {
        this.repartidor = repartidor;
    }

    public String getEvidenciaEntrega() {
        return evidenciaEntrega;
    }

    public void setEvidenciaEntrega(String evidenciaEntrega) {
        this.evidenciaEntrega = evidenciaEntrega;
    }

    public List<DetallePedido> getDetalle() {
        return detalle;
    }

    public void setDetalle(List<DetallePedido> detalle) {
        this.detalle = detalle;
    }
}
