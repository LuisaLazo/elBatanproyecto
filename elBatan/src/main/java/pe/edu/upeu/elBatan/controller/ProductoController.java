package pe.edu.upeu.elBatan.controller;

import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.upeu.elBatan.dto.ProductoDTO;
import pe.edu.upeu.elBatan.exception.ResourceNotFoundException;
import pe.edu.upeu.elBatan.services.IFileStorageService;
import pe.edu.upeu.elBatan.services.IProductoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {

    private final IProductoService productoService;
    private final IFileStorageService fileStorageService;

    public ProductoController(
            IProductoService productoService,
            IFileStorageService fileStorageService
    ) {
        this.productoService = productoService;
        this.fileStorageService = fileStorageService;
    }

    // PROCESO-GetMapping-LISTAR + RETORNO DE RESPUESTA POR ENTIDAD
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listar() {
        return ResponseEntity.ok(productoService.listarTodo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producto no encontrado con ID: " + id
                ));
    }

    // PROCESO-PostMapping-PARTE.MULTIPART
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDTO> crear(
            @ModelAttribute @ParameterObject @Valid ProductoDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        String nombreImagen = file != null && !file.isEmpty()
                ? fileStorageService.store(file)
                : "no-image.png";

        // VALORES POR IMAGEN
        ProductoDTO productoConImagen = new ProductoDTO(
                null,
                dto.nombre(),
                dto.descripcion(),
                dto.precio(),
                dto.stock(),
                nombreImagen
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.crear(productoConImagen));
    }

    // PROCESO - PutMapping-MULTIPART, ID.CONSUME
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDTO> actualizar(
            @PathVariable Long id,
            @ModelAttribute @ParameterObject @Valid ProductoDTO dto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        String nuevaImagen = file != null && !file.isEmpty()
                ? fileStorageService.store(file)
                : null;

        ProductoDTO dtoParaActualizar = new ProductoDTO(
                id,
                dto.nombre(),
                dto.descripcion(),
                dto.precio(),
                dto.stock(),
                nuevaImagen
        );

        try {
            return productoService.actualizar(id, dtoParaActualizar)
                    .map(ResponseEntity::ok)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado con ID: " + id
                    ));
        } catch (RuntimeException ex) {
            if (nuevaImagen != null) {
                fileStorageService.delete(nuevaImagen);
            }
            throw ex;
        }
    }

    // PROCESO-DELETEMapping-ID.ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (productoService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        throw new ResourceNotFoundException("No se pudo eliminar con ID: " + id);
    }
}