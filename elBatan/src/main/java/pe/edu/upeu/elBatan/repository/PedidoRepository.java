
package pe.edu.upeu.elBatan.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.entity.Pedido;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByPersonaIdPersona(Long id);

    List<Pedido> findByEstado(Estado estado);

    List<Pedido> findByEstadoAndRepartidorIsNull(Estado estado);

    List<Pedido> findByRepartidorIdUsuario(Long idRepartidor);


    List<Pedido> findByRepartidorIdUsuarioAndEstado(
            Long idRepartidor,
            Estado estado
    );



    @Modifying
    @Query(value = """
    UPDATE ELBATANLP2.PEDIDO
    SET ID_REPARTIDOR = :idRepartidor,
        ESTADO = 'EN_CAMINO'
    WHERE ID_PEDIDO = :idPedido
      AND ESTADO = 'EN_LOCAL'
      AND ID_REPARTIDOR IS NULL
    """, nativeQuery = true)
    int asignarRepartidor(
            @Param("idPedido") Long idPedido,
            @Param("idRepartidor") Long idRepartidor
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT p
    FROM Pedido p
    WHERE p.idPedido = :idPedido
    """)
    Optional<Pedido> buscarParaEntrega(
            @Param("idPedido") Long idPedido
    );
}
