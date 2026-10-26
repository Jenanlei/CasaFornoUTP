package com.casaforno.casa_forno.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.casaforno.casa_forno.models.Categoria;

public interface  CategoriaRepository extends JpaRepository<Categoria, Long>{

}