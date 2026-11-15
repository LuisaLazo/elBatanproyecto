package pe.edu.upeu.elBatan.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.elBatan.dto.ParticipacionProductoDTO;
import pe.edu.upeu.elBatan.dto.ReporteVentaDTO;
import pe.edu.upeu.elBatan.dto.ResumenVentasDTO;

import pe.edu.upeu.elBatan.services.ParticipacionProductoService;
import pe.edu.upeu.elBatan.services.ReporteService;
import pe.edu.upeu.elBatan.services.ResumenVentasService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@CrossOrigin
public class ReporteController {

    private final ReporteService reporteService;
    private final ResumenVentasService resumenVentasService;
    private final ParticipacionProductoService participacionProductoService;

    public ReporteController(ReporteService reporteService, ResumenVentasService resumenVentasService, ParticipacionProductoService participacionProductoService) {
        this.reporteService = reporteService;
        this.resumenVentasService = resumenVentasService;
        this.participacionProductoService = participacionProductoService;
    }

    @GetMapping("/ventas")
    public List<ReporteVentaDTO> listarVentas() {
        return reporteService.listarVentas();
    }

    @GetMapping("/resumen")
    public ResumenVentasDTO obtenerResumen(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fin
    ) {
        return resumenVentasService.obtenerResumen(inicio, fin);
    }

    @GetMapping("/participacion-productos")
    public ResponseEntity<List<ParticipacionProductoDTO>> listarParticipacionProductos() {
        return ResponseEntity.ok(participacionProductoService.listar());
    }
}