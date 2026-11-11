package pe.edu.upeu.elBatan.services;

import pe.edu.upeu.elBatan.dto.PersonaDto;

public interface PersonaService {
    PersonaDto.Response obtenerOPersistirPorDni(String dni);
}