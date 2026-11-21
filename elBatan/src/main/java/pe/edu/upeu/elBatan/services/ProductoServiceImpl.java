package pe.edu.upeu.elBatan.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import pe.edu.upeu.elBatan.dto.ProductoDTO;
import pe.edu.upeu.elBatan.entity.Producto;
import pe.edu.upeu.elBatan.repository.ProductoRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements IProductoService {

    private static final String RUTA_IMAGENES = "/elBatan/images/";
    private static final String IMAGEN_PREDETERMINADA = "no-image.png";

    private final ProductoRepository productoRepository;
    private final IFileStorageService fileStorageService;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            IFileStorageService fileStorageService
    ) {
        this.productoRepository = productoRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodo() {
        return productoRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorId(Long id) {
        return productoRepository.findById(id).map(this::convertToDTO);
    }

    @Override
    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = new Producto();
        producto.setNombre(dto.nombre());
        producto.setDescripcion(dto.descripcion());
        producto.setPrecio(dto.precio());
        producto.setStock(dto.stock());
        producto.setImagen(dto.imagen());
        return convertToDTO(productoRepository.save(producto));
    }

    @Override
    @Transactional
    public Optional<ProductoDTO> actualizar(Long id, ProductoDTO dto) {
        return productoRepository.findById(id).map(producto -> {
            String imagenAnterior = nombreArchivo(producto.getImagen());
            String nuevaImagen = dto.imagen();

            producto.setNombre(dto.nombre());
            producto.setDescripcion(dto.descripcion());
            producto.setPrecio(dto.precio());
            producto.setStock(dto.stock());

            if (nuevaImagen != null && !nuevaImagen.isBlank()) {
                producto.setImagen(nuevaImagen);

                if (imagenAnterior != null && !imagenAnterior.equals(nuevaImagen)
                        && !IMAGEN_PREDETERMINADA.equals(imagenAnterior)
                        && !imagenAnterior.contains("/") && !imagenAnterior.contains("\\")) {
                    TransactionSynchronizationManager.registerSynchronization(
                            new TransactionSynchronization() {
                                @Override
                                public void afterCompletion(int status) {
                                    if (status == STATUS_COMMITTED) {
                                        fileStorageService.delete(imagenAnterior);
                                    }
                                }
                            }
                    );
                }
            } else {
                producto.setImagen(imagenAnterior);
            }

            return convertToDTO(productoRepository.save(producto));
        });
    }

    @Override
    @Transactional
    public boolean eliminar(Long id) {
        return productoRepository.findById(id).map(producto -> {
            if (producto.getImagen() != null) {
                fileStorageService.delete(producto.getImagen());
            }
            productoRepository.delete(producto);
            return true;
        }).orElse(false);
    }

    private ProductoDTO convertToDTO(Producto producto) {
        String nombre = nombreArchivo(producto.getImagen());
        String rutaImagen = nombre == null || nombre.isBlank()
                ? null
                : RUTA_IMAGENES + nombre;

        return new ProductoDTO(
                producto.getIdProducto(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getStock(),
                rutaImagen
        );
    }

    private String nombreArchivo(String imagen) {
        // Corrige los prefijos repetidos que dejaron las ediciones anteriores.
        while (imagen != null && imagen.startsWith(RUTA_IMAGENES)) {
            imagen = imagen.substring(RUTA_IMAGENES.length());
        }
        return imagen;
    }
}