package com.casaforno.casa_forno.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.casaforno.casa_forno.models.Reserva;

public interface ReservaRepository extends JpaRepository<Reserva, Long>{
   
}