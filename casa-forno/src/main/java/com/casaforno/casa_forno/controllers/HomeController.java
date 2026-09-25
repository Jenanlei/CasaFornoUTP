package com.casaforno.casa_forno.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;


@Controller 
public class HomeController {

    @GetMapping("/index")
    public String inicio() {
        return "index";
    }

    @GetMapping("/categoria")
    public String categoria(@RequestParam(name = "cat", required = false) String cat, Model model) {
        model.addAttribute("cat", cat);
        return "categoria";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/admin")
    public String admin(){
        return "admin";
    }


    @GetMapping("/panelIconos")
    public String panelIconos() {
        return "panelIconos";
    }   

    

}