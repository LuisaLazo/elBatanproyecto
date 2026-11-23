
package pe.edu.upeu.elBatan.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class EvidenciaEntregaService {

    private final Path directorio;

    public EvidenciaEntregaService(
            @Value("${evidencias.location}") String ubicacion
    ) {
        this.directorio = Paths.get(ubicacion)
                .toAbsolutePath()
                .normalize();
    }

    public String guardar(MultipartFile archivo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes adjuntar una fotografía"
            );
        }

        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fotografía no debe superar los 5 MB"
            );
        }

        String tipo = archivo.getContentType();

        if (tipo == null ||
                !Set.of("image/jpeg", "image/png").contains(tipo)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permiten fotografías JPG o PNG"
            );
        }

        try {
            BufferedImage imagen = ImageIO.read(
                    archivo.getInputStream()
            );

            if (imagen == null ||
                    imagen.getWidth() <= 0 ||
                    imagen.getHeight() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El archivo no contiene una imagen válida"
                );
            }

            Files.createDirectories(directorio);

            String extension = tipo.equals("image/png")
                    ? "png" : "jpg";

            String nombre = UUID.randomUUID() + "." + extension;

            Path destino = directorio.resolve(nombre).normalize();

            if (!destino.getParent().equals(directorio)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ruta de archivo no válida"
                );
            }

            boolean guardado = ImageIO.write(
                    imagen,
                    extension.equals("jpg") ? "jpeg" : "png",
                    destino.toFile()
            );

            if (!guardado) {
                throw new IOException(
                        "No se pudo codificar la fotografía"
                );
            }

            return nombre;

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo guardar la evidencia",
                    ex
            );
        }
    }

    public void eliminar(String nombre) {

        if (nombre == null || nombre.isBlank()) {
            return;
        }

        try {
            Path archivo = directorio.resolve(nombre).normalize();

            if (archivo.getParent().equals(directorio)) {
                Files.deleteIfExists(archivo);
            }

        } catch (IOException ex) {
            throw new IllegalStateException(
                    "No se pudo eliminar la evidencia",
                    ex
            );
        }
    }


    public byte[] obtener(String nombreArchivo) {

        if (nombreArchivo == null || nombreArchivo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No existe evidencia para este pedido"
            );
        }

        try {
            Path archivo = directorio.resolve(nombreArchivo)
                    .normalize();

            // Evitar acceder a archivos fuera del directorio
            if (!archivo.getParent().equals(directorio)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ruta de archivo no válida"
                );
            }

            if (!Files.isRegularFile(archivo)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Fotografía no encontrada"
                );
            }

            return Files.readAllBytes(archivo);

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo leer la fotografía",
                    ex
            );
        }
    }

}
