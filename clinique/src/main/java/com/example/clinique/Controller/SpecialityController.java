package com.example.clinique.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;


import com.example.clinique.entities.Speciality;
import com.example.clinique.repository.SpecialityRepository;

// SpecialityController.java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class SpecialityController {

    @Autowired
    private SpecialityRepository specialityRepository;

    @GetMapping("/specialities")
    public List<Speciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    // ✅ Create
    @PostMapping("/specialities")
    public Speciality createSpeciality(@RequestBody Speciality speciality) {
        return specialityRepository.save(speciality);
    }

    // ✅ Get by ID
    @GetMapping("/specialities/{id}")
    public Speciality getSpecialityById(@PathVariable Long id) {
        return specialityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialité non trouvée"));
    }

    // ✅ Update
    @PutMapping("/specialities/{id}")
    public Speciality updateSpeciality(@PathVariable Long id, @RequestBody Speciality updatedSpeciality) {
        Speciality speciality = specialityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialité non trouvée"));

        speciality.setTitle(updatedSpeciality.getTitle());
        speciality.setDescription(updatedSpeciality.getDescription());
        speciality.setDetails(updatedSpeciality.getDetails());
        speciality.setIconName(updatedSpeciality.getIconName());

        return specialityRepository.save(speciality);
    }

    // ✅ Delete
    @DeleteMapping("/specialities/{id}")
    public void deleteSpeciality(@PathVariable Long id) {
        specialityRepository.deleteById(id);
    }
}
