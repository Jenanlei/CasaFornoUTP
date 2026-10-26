package com.casaforno.casa_forno.controllers;

import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.casaforno.casa_forno.models.EstadoReserva;
import com.casaforno.casa_forno.models.Reserva;
import com.casaforno.casa_forno.models.Usuario;
import com.casaforno.casa_forno.repositories.ReservaRepository;
import com.casaforno.casa_forno.repositories.UsuarioRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
    
    @Autowired
    private ReservaRepository repo;
    @Autowired
    private UsuarioRepository repoUsuario;

    @GetMapping
    public List<Reserva> listar(@RequestParam(required = false) Long usuarioId) {
        List<Reserva> todas = repo.findAll();
        if (usuarioId == null) return todas;
        return todas.stream().filter(r -> r.getUsuario().getId().equals(usuarioId)).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva crear(@Valid @RequestBody Reserva datos) {
        if (datos.getHora().isBefore(LocalTime.of(13, 0)) || datos.getHora().isAfter(LocalTime.of(22, 0))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Atendemos de 1:00 pm a 11:00 pm (última reserva 10:00 pm)");
        }
        Long idUsuario = datos.getUsuario().getId();
        if (idUsuario == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inicia sesión para reservar");
        Usuario u = repoUsuario.findById(idUsuario).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no existe"));
        datos.setId(null);
        datos.setEstado(EstadoReserva.PENDIENTE);
        datos.setUsuario(u);
        return repo.save(datos);
    }

    @PatchMapping("/{id}/estado")
    public Reserva cambiarEstado(@PathVariable Long id, @RequestParam EstadoReserva estado) {
        Reserva r = repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        r.setEstado(estado);
        return repo.save(r);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        Reserva r = repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        repo.delete(r);
    }

}