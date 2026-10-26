package com.casaforno.casa_forno.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.casaforno.casa_forno.models.Categoria;
import com.casaforno.casa_forno.repositories.CategoriaRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    
    @Autowired 
    private CategoriaRepository repo;

    @GetMapping
    public List<Categoria> listar() {
        return repo.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria crear(@Valid @RequestBody Categoria datos) {
        boolean existe = repo.findAll().stream().anyMatch(c -> c.getSlug().equals(datos.getSlug()));
        if (existe) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una categoría con ese identificador");
        datos.setId(null);
        return repo.save(datos);
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Long id, @Valid @RequestBody Categoria nueva) {
        Categoria c = buscar(id);
        boolean existe = repo.findAll().stream()
                .anyMatch(o -> o.getSlug().equals(nueva.getSlug()) && !o.getId().equals(id));
        if (existe) throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una categoría con ese identificador");
        c.setSlug(nueva.getSlug());
        c.setNombre(nueva.getNombre());
        c.setIcono(nueva.getIcono());
        c.setVisible(nueva.isVisible());
        return repo.save(c);
    }

    @PatchMapping("/{id}/visible")
    public Categoria alternarVisible(@PathVariable Long id) {
        Categoria c = buscar(id);
        c.setVisible(!c.isVisible());
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        repo.delete(buscar(id));
    }

    private Categoria buscar(Long id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }
}