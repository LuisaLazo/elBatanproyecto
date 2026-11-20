package pe.edu.upeu.elBatan.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.elBatan.dto.PersonaDto;
import pe.edu.upeu.elBatan.services.PersonaService;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @PostMapping("/consultar")
    public ResponseEntity<PersonaDto.Response> buscarPorRequest(@RequestBody @Valid PersonaDto.Request request) {
        return ResponseEntity.ok(personaService.obtenerOPersistirPorDni(request.dni()));
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<PersonaDto.Response> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(personaService.obtenerOPersistirPorDni(dni));
    }
}