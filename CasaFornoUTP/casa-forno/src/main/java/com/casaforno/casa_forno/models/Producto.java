package com.casaforno.casa_forno.models;

import java.math.BigDecimal;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "producto")
@Getter
@Setter
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String nombre;

    @Size(max = 255, message = "La descripción no puede superar 255 caracteres")
    @Column(length = 255)
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal precio;

    @Column(length = 500)
    private String imagen;

    private boolean visible = true;

    @NotNull(message = "Selecciona una categoría")
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;
}