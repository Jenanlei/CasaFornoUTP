package com.casaforno.casa_forno.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import com.casaforno.casa_forno.models.Rol;
import com.casaforno.casa_forno.models.Usuario;
import com.casaforno.casa_forno.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repo;

    public record LoginRequest(
            @NotBlank(message = "El correo es obligatorio") String correo,
            @NotBlank(message = "La contraseña es obligatoria") String clave) {}

    @PostMapping("/usuarios")
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario registrar(@Valid @RequestBody Usuario datos) {
        String correo = datos.getCorreo().trim().toLowerCase();
        boolean existe = repo.findAll().stream().anyMatch(u -> u.getCorreo().equals(correo));
        if (existe) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta registrada con ese correo.");
        datos.setId(null);
        datos.setCorreo(correo);
        datos.setRol(Rol.CLIENTE);   // nadie se registra como ADMIN desde la API
        return repo.save(datos);
    }

    @PostMapping("/auth/login")
    public Usuario login(@Valid @RequestBody LoginRequest req) {
        String correo = req.correo().trim().toLowerCase();
        return repo.findAll().stream()
                .filter(u -> u.getCorreo().equals(correo) && u.getClave().equals(req.clave()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
    }

}