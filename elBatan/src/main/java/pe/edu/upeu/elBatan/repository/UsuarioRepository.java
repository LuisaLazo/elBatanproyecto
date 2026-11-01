package pe.edu.upeu.elBatan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.elBatan.entity.Usuario;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
    boolean existsByUsuario(String usuario); //validar si existe
    Optional<Usuario> findByUsuario(String usuario); //encontrar su informacion



}