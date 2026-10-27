package com.casaforno.casa_forno.models;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categoria")
@Getter
@Setter
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El identificador es obligatorio")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Solo minúsculas, números y guiones")
    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    @Column(nullable = false, length = 50)
    private String nombre;

    @Pattern(regexp = "^bi-[a-z0-9-]+$", message = "El ícono debe ser una clase de Bootstrap Icons (ej. bi-fire)")
    @Column(length = 50)
    private String icono;

    // URL de la foto de la categoría (opcional). Se guarda en MySQL.
    @Size(max = 500, message = "La URL no puede superar 500 caracteres")
    @Pattern(regexp = "^(https?://|/).*", message = "La imagen debe ser una URL (https://...) o una ruta (/img/...)")
    @Column(length = 500)
    private String imagen;

    // Texto corto que se muestra bajo el nombre en la carta (opcional)
    @Size(max = 150, message = "La descripción no puede superar 150 caracteres")
    @Column(length = 150)
    private String descripcion;

    private boolean visible = true;

    // Una Categoría tiene muchos Productos
    @JsonIgnore
    @OneToMany(mappedBy = "categoria")
    private List<Producto> productos = new ArrayList<>();
}

