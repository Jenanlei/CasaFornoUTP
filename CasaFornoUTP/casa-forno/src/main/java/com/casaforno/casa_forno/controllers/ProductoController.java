package com.casaforno.casa_forno.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.casaforno.casa_forno.models.Categoria;
import com.casaforno.casa_forno.models.Producto;
import com.casaforno.casa_forno.repositories.CategoriaRepository;
import com.casaforno.casa_forno.repositories.ProductoRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    
    @Autowired
    private ProductoRepository repo;
    @Autowired
    private CategoriaRepository repoCategoria;

    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) String categoria) {
        List<Producto> todos = repo.findAll();
        if (categoria == null) return todos;
        return todos.stream().filter(p -> p.getCategoria().getSlug().equals(categoria)).toList();
    }

    @PostMapping ("")
    @ResponseStatus(HttpStatus.CREATED)
    public Producto crear(@Valid @RequestBody Producto datos) {
        datos.setId(null);
        datos.setCategoria(resolverCategoria(datos));
        return repo.save(datos);
    }

        @PostMapping("/lote")
    @ResponseStatus(HttpStatus.CREATED)
    public List<Producto> crearLote(@RequestBody List<@Valid Producto> lista) {
        for (Producto p : lista) {
            p.setId(null);
            p.setCategoria(resolverCategoria(p));
        }
        return repo.saveAll(lista);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody Producto nuevo) {
        Producto p = buscar(id);
        p.setNombre(nuevo.getNombre());
        p.setDescripcion(nuevo.getDescripcion());
        p.setPrecio(nuevo.getPrecio());
        p.setImagen(nuevo.getImagen());
        p.setVisible(nuevo.isVisible());
        p.setCategoria(resolverCategoria(nuevo));
        return repo.save(p);
    }

    @PatchMapping("/{id}/visible")
    public Producto alternarVisible(@PathVariable Long id) {
        Producto p = buscar(id);
        p.setVisible(!p.isVisible());
        return repo.save(p);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        repo.delete(buscar(id));
    }

    private Producto buscar(Long id) {
        return repo.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Categoria resolverCategoria(Producto datos) {
        Long idCat = datos.getCategoria().getId();
        if (idCat == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una categoría");
        return repoCategoria.findById(idCat).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría no existe"));
    }
    
}