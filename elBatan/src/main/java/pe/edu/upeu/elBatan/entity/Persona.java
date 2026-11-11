package pe.edu.upeu.elBatan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "persona")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPersona;

    @Column(nullable = false, length = 8, unique = true)
    private String dni;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String apellidoPaterno;

    @Column(length = 100)
    private String apellidoMaterno;

    @Column(unique = true)
    private String email;

    private String telefono;
    private String direccion;

    public Persona() {
    }

    public Persona(String dni, String nombre, String apellidoPaterno, String apellidoMaterno) {
        this.dni = dni;
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
    }

    public Long getIdPersona() { return idPersona; }
    public void setIdPersona(Long idPersona) { this.idPersona = idPersona; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}