package pe.edu.upeu.elBatan.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.elBatan.dto.DetalleResponseDTO;
import pe.edu.upeu.elBatan.dto.ItemVentaDTO;
import pe.edu.upeu.elBatan.dto.PedidoResponseDTO;
import pe.edu.upeu.elBatan.dto.VentaDTO;
import pe.edu.upeu.elBatan.entity.*;
import pe.edu.upeu.elBatan.entity.Estado;
import pe.edu.upeu.elBatan.exception.InsufficientStockException;
import pe.edu.upeu.elBatan.exception.ResourceNotFoundException;
import pe.edu.upeu.elBatan.repository.PedidoRepository;
import pe.edu.upeu.elBatan.repository.PersonaRepository;
import pe.edu.upeu.elBatan.repository.ProductoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServiceImpl implements IPedidoService{
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final PersonaRepository personaRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository, ProductoRepository productoRepository, PersonaRepository personaRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.personaRepository = personaRepository;
    }

    @Override
    @Transactional
    public PedidoResponseDTO realizarPedido(VentaDTO dto) {
        //1. validar el cliente
        Persona persona = personaRepository.findById(dto.idPersona())
                .orElseThrow(()-> new ResourceNotFoundException("Cliente no encontrado"));
        //2. creamos la cabecera del pedido
        Pedido pedido = new Pedido();
        pedido.setPersona(persona);
        pedido.setEstado(Estado.EN_LOCAL);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setDireccion(dto.direccion());

        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal totalPedido = BigDecimal.ZERO;
        //3. Procesamos cada item del carrito
        for (ItemVentaDTO item: dto.items()){
            Producto producto = productoRepository.findById(item.idProducto())
                    .orElseThrow(()-> new ResourceNotFoundException("Producto: "+item.idProducto()+" No existe"));
            //4. Validar stock
            if (producto.getStock() <item.cantidad()){
                throw new InsufficientStockException("Stock insuficiente de "+producto.getNombre());
            }
            //actualizar el stock
            producto.setStock(producto.getStock() -item.cantidad());
            productoRepository.save(producto);
            //creamos el detalle
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            BigDecimal subTotal = producto.getPrecio().multiply(new BigDecimal(item.cantidad()));
            detalle.setSubtotal(subTotal);
            detalles.add(detalle);
            totalPedido = totalPedido.add(subTotal);


        }

        //guardar pedido y detalles
        pedido.setTotal(totalPedido);
        pedido.setDetalle(detalles);
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        //convertir los detalles guardados a DTOs para la respuesta
        List<DetalleResponseDTO> productoResponse = pedidoGuardado.getDetalle().stream()
                .map(d-> new DetalleResponseDTO(
                        d.getProducto().getNombre(),
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getSubtotal()
                )).toList();
        //Devolver la respuesta completa

        return new PedidoResponseDTO(
                pedidoGuardado.getIdPedido(),
                persona.getNombre(),
                pedidoGuardado.getTotal(),
                pedidoGuardado.getEstado().name(),
                pedidoGuardado.getFechaPedido(),
                pedidoGuardado.getDireccion(),
                productoResponse
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodo() {
        return pedidoRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public Optional<PedidoResponseDTO> buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorEstado(Estado estado) {

        return pedidoRepository.findByEstado(estado.name())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    public Optional<PedidoResponseDTO> actualizarEstado(Long id, String estado) {

        return pedidoRepository.findById(id)
                .map(pedido -> {

                    try {
                        Estado nuevoEstado = Estado.valueOf(
                                estado.toUpperCase()
                        );

                        pedido.setEstado(nuevoEstado);

                        Pedido pedidoActualizado =
                                pedidoRepository.save(pedido);

                        return convertToDTO(pedidoActualizado);

                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException(
                                "Estado de pedido no válido: " + estado
                        );
                    }
                });
    }

    @Override
    public boolean eliminar(Long id) {

        if (pedidoRepository.existsById(id)) {
            pedidoRepository.deleteById(id);
            return true;
        }

        return false;
    }


    private PedidoResponseDTO convertToDTO(Pedido pedido) {

        List<DetalleResponseDTO> detalleResponse = pedido.getDetalle()
                .stream()
                .map(d -> new DetalleResponseDTO(
                        d.getProducto().getNombre(),
                        d.getCantidad(),
                        d.getPrecioUnitario(),
                        d.getSubtotal()
                ))
                .toList();

        return new PedidoResponseDTO(
                pedido.getIdPedido(),
                pedido.getPersona().getNombre(),
                pedido.getTotal(),
                pedido.getEstado().name(),
                pedido.getFechaPedido(),
                pedido.getDireccion(),
                detalleResponse
        );
    }
}
