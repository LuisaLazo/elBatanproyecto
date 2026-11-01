package pe.edu.upeu.elBatan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.elBatan.entity.Persona;

@Repository
public interface PersonaRepository extends JpaRepository<Persona,Long> {
    boolean existsByEmail(String email);


}