package pe.edu.upeu.elBatan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upeu.elBatan.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

}
