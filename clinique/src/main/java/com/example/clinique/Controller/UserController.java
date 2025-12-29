package com.example.clinique.Controller;

import com.example.clinique.dto.MedecinRequest;
import com.example.clinique.entities.User;
import com.example.clinique.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService ) {
        this.userService = userService;
    }

    // ✅ Lister tous les utilisateurs
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ✅ Obtenir un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Créer un utilisateur
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // ✅ Mettre à jour un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        return userService.getUserById(id).map(user -> {
            user.setNom(userDetails.getNom());
            user.setPrenom(userDetails.getPrenom());
            user.setEmail(userDetails.getEmail());
            user.setMot_de_passe(userDetails.getMot_de_passe());
            user.setRole(userDetails.getRole());
            User updatedUser = userService.saveUser(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }

 @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        return userService.deleteUser(id);
    }   
@CrossOrigin(origins = "http://localhost:3000")
@PostMapping("/create-medecin")
    
    public ResponseEntity<?> createMedecin(@RequestBody MedecinRequest request) {
        return userService.createMedecin(request);
    }

@PutMapping("/update-medecin/{id}") 
public ResponseEntity<?> updateMedecin(@PathVariable Integer id, @RequestBody MedecinRequest request) 
   {
     return userService.updateMedecin(id, request);
    } 
     
}
