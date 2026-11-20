package pe.edu.upeu.elBatan.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import pe.edu.upeu.elBatan.dto.PersonaDto;
import pe.edu.upeu.elBatan.entity.Persona;
import pe.edu.upeu.elBatan.repository.PersonaRepository;

import java.util.Optional;

@Service
public class PersonaServiceImpl implements PersonaService {

    private final PersonaRepository personaRepository;
    private final RestClient restClient;

    @Value("${reniec.api.url}")
    private String reniecUrl;

    @Value("${reniec.api.token}")
    private String reniecToken;

    public PersonaServiceImpl(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
        this.restClient = RestClient.create();
    }

    @Override
    @Transactional
    public PersonaDto.Response obtenerOPersistirPorDni(String dniConsultado) {
        validarDniFormato(dniConsultado);

        Optional<Persona> personaDb = personaRepository.findByDni(dniConsultado);
        if (personaDb.isPresent()) {
            Persona p = personaDb.get();
            String apellidos = combinarApellidos(p.getApellidoPaterno(), p.getApellidoMaterno());
            return new PersonaDto.Response(p.getDni(), p.getNombre(), apellidos);
        }

        String targetUrl = reniecUrl.endsWith("/") ? reniecUrl + dniConsultado : reniecUrl + "/" + dniConsultado;

        PersonaDto.FactilizaResponse apiResponse;
        try {
            apiResponse = restClient.get()
                    .uri(targetUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + reniecToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(PersonaDto.FactilizaResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Error en la conexión con la API externa de RENIEC: " + e.getMessage(), e);
        }

        if (apiResponse == null || !apiResponse.success() || apiResponse.data() == null) {
            throw new RuntimeException("No se encontraron registros para el DNI en la RENIEC");
        }

        PersonaDto.FactilizaData data = apiResponse.data();

        String dniFinal = (data.dni() != null && !data.dni().isBlank()) ? data.dni() : dniConsultado;
        String nombres = (data.nombres() != null) ? data.nombres() : "";
        String apePaterno = (data.apellidoPaterno() != null) ? data.apellidoPaterno() : "";
        String apeMaterno = (data.apellidoMaterno() != null) ? data.apellidoMaterno() : "";

        Persona nuevaPersona = new Persona(dniFinal, nombres, apePaterno, apeMaterno);
        Persona personaGuardada = personaRepository.save(nuevaPersona);

        String apellidosCombinados = combinarApellidos(personaGuardada.getApellidoPaterno(), personaGuardada.getApellidoMaterno());
        return new PersonaDto.Response(personaGuardada.getDni(), personaGuardada.getNombre(), apellidosCombinados);
    }

    private void validarDniFormato(String dni) {
        if (dni == null || !dni.matches("\\d{8}")) {
            throw new IllegalArgumentException("El DNI debe contener exactamente 8 dígitos numéricos");
        }
    }

    private String combinarApellidos(String paterno, String materno) {
        String p = (paterno != null) ? paterno.trim() : "";
        String m = (materno != null) ? materno.trim() : "";
        return (p + " " + m).trim();
    }
}