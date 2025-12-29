// src/main/java/com/example/clinique/config/WebConfig.java
package com.example.clinique.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.upload.dir:/app/uploads/}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        try {
            System.out.println("=".repeat(60));
            System.out.println("🚀 INITIALISATION CONFIGURATION UPLOADS");
            System.out.println("=".repeat(60));
            
            // Afficher la configuration
            System.out.println("📋 Configuration chargée depuis application.properties:");
            System.out.println("   app.upload.dir = " + uploadDir);
            
            // Convertir en chemin absolu
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            System.out.println("📁 Chemin absolu résolu: " + uploadPath);
            
            // Créer le dossier s'il n'existe pas
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Dossier créé avec succès");
            }
            
            // Vérifier les permissions
            System.out.println("🔍 Vérification des permissions:");
            System.out.println("   • Dossier existe: " + (Files.exists(uploadPath) ? "✓ OUI" : "✗ NON"));
            System.out.println("   • Est un dossier: " + (Files.isDirectory(uploadPath) ? "✓ OUI" : "✗ NON"));
            System.out.println("   • Peut lire: " + (Files.isReadable(uploadPath) ? "✓ OUI" : "✗ NON"));
            System.out.println("   • Peut écrire: " + (Files.isWritable(uploadPath) ? "✓ OUI" : "✗ NON"));
            
            // Lister les fichiers existants
            if (Files.exists(uploadPath) && Files.isDirectory(uploadPath)) {
                try (var files = Files.list(uploadPath)) {
                    long fileCount = files.count();
                    System.out.println("📊 Nombre de fichiers dans le dossier: " + fileCount);
                    
                    if (fileCount > 0) {
                        System.out.println("📄 Liste des fichiers:");
                        try (var files2 = Files.list(uploadPath)) {
                            files2.limit(10).forEach(path -> {
                                try {
                                    System.out.println("   • " + path.getFileName() + 
                                                     " (" + Files.size(path) + " octets)");
                                } catch (Exception e) {
                                    System.out.println("   • " + path.getFileName());
                                }
                            });
                        }
                    }
                }
            }
            
            System.out.println("=".repeat(60));
            System.out.println("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS");
            System.out.println("=".repeat(60));
            
        } catch (Exception e) {
            System.err.println("❌ ERREUR CRITIQUE DANS L'INITIALISATION:");
            System.err.println("   Message: " + e.getMessage());
            System.err.println("   Cause: " + e.getCause());
            e.printStackTrace();
            System.err.println("=".repeat(60));
        }
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            System.out.println("🔧 CONFIGURATION DES RESSOURCES STATIQUES");
            
            // Résoudre le chemin
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String resourceLocation = "file:" + uploadPath + File.separator;
            
            System.out.println("   Pattern: /uploads/**");
            System.out.println("   Location: " + resourceLocation);
            
            // Configurer le handler
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(resourceLocation)
                    .setCachePeriod(3600);
            
            System.out.println("✅ HANDLER CONFIGURÉ AVEC SUCCÈS");
            System.out.println("   Les fichiers seront accessibles via:");
            System.out.println("   http://localhost:8080/uploads/{nom_du_fichier}");
            System.out.println("=".repeat(60));
            
        } catch (Exception e) {
            System.err.println("❌ ERREUR CONFIGURATION RESOURCE HANDLER:");
            System.err.println("   " + e.getMessage());
            System.err.println("=".repeat(60));
            
            // Fallback: configuration minimale
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:/app/uploads/")
                    .setCachePeriod(3600);
        }
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        System.out.println("🌐 CONFIGURATION CORS");
        
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // Frontend React
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
        
        System.out.println("✅ CORS CONFIGURÉ POUR: http://localhost:3000");
        System.out.println("=".repeat(60));
    }
}