package com.casaforno.casa_forno.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.casaforno.casa_forno.models.Producto;

public interface  ProductoRepository extends JpaRepository<Producto, Long> {
    
}
