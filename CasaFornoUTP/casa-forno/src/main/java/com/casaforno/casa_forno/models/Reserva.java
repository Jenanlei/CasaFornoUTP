package com.casaforno.casa_forno.models;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "reserva")
@Getter
@Setter
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^9\\d{8}$", message = "Ingresa un celular de 9 dígitos que empiece con 9")
    @Column(nullable = false, length = 9)
    private String telefono;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "No se puede reservar en una fecha pasada")
    @Column(nullable = false)
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    @Column(nullable = false)
    private LocalTime hora;

    @NotNull(message = "Indica el número de personas")
    @Min(value = 1, message = "Mínimo 1 persona")
    @Max(value = 20, message = "Máximo 20 personas")
    @Column(nullable = false)
    private Integer personas;

    @Size(max = 200, message = "La nota no puede superar 200 caracteres")
    @Column(length = 200)
    private String nota;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    @NotNull(message = "La reserva debe pertenecer a un usuario")
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;
}
