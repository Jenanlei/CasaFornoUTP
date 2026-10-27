package com.casaforno.casa_forno.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.casaforno.casa_forno.models.Usuario;

public interface  UsuarioRepository extends JpaRepository<Usuario, Long>{

}