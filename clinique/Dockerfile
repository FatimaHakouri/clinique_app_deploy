# Étape 1 : Build de l'application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .
# Télécharger les dépendances (cached dans une couche séparée)
RUN mvn dependency:go-offline

# Copier le code source
COPY src ./src

# Build de l'application
RUN mvn clean package -DskipTests

# Étape 2 : Création de l'image finale
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copier le JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Créer le dossier uploads
RUN mkdir -p /app/uploads

# Exposer le port
EXPOSE 8080

# Commande d'exécution
ENTRYPOINT ["java", "-jar", "app.jar"]