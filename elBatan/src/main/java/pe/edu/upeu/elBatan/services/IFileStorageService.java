package pe.edu.upeu.elBatan.services;

import org.springframework.web.multipart.MultipartFile;


    public interface IFileStorageService {
        void init(); // Crea la carpeta si no existe
        String store(MultipartFile file); // Guarda el archivo y devuelve el nombre único
        void delete(String filename); // Borra el archivo (útil al actualizar o eliminar producto)
    }


