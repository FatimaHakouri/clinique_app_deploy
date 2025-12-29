terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = "npipe:////./pipe/docker_engine"
}

# 1. Volume MySQL
resource "docker_volume" "mysql_data" {
  name = "mysql_data"
}

# 2. Réseau
resource "docker_network" "clinique_network" {
  name   = "clinique-network"
  driver = "bridge"
}

# 3. MySQL - D'abord
resource "docker_container" "mysql" {
  name  = "clinique-mysql"
  image = "mysql:8.0"

  env = [
    "MYSQL_ROOT_PASSWORD=rootpassword",
    "MYSQL_DATABASE=clinique_db"
  ]

  ports {
    internal = 3306
    external = 3306
  }

  volumes {
    volume_name    = docker_volume.mysql_data.name
    container_path = "/var/lib/mysql"
  }

  volumes {
    host_path      = abspath("${path.module}/../mysql/init.sql")
    container_path = "/docker-entrypoint-initdb.d/init.sql"
  }

  networks_advanced {
    name = docker_network.clinique_network.name
  }

  restart = "always"
}

# 4. Backend - Après MySQL (avec délai de démarrage)
resource "docker_container" "backend" {
  name  = "backend"
  image = "fatimazahra004/clinique-backend:latest"

  ports {
    internal = 8080
    external = 8080
  }

  env = [
    "SPRING_DATASOURCE_URL=jdbc:mysql://clinique-mysql:3306/clinique_db?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false",
    "SPRING_DATASOURCE_USERNAME=root",
    "SPRING_DATASOURCE_PASSWORD=rootpassword",
    "SPRING_JPA_HIBERNATE_DDL_AUTO=update"
  ]

  volumes {
    host_path      = abspath("${path.module}/../uploads")
    container_path = "/app/uploads"
  }

  networks_advanced {
    name = docker_network.clinique_network.name
  }

  # ⬇️ IMPORTANT : Dépend de MySQL ET a un restart policy
  depends_on = [docker_container.mysql]
  restart = "on-failure"
  
  # ⬇️ SIMPLE COMMANDE QUI FONCTIONNE
  command = ["/bin/sh", "-c", "sleep 30 && java -jar app.jar"]
}

# 5. Frontend - Après Backend
resource "docker_container" "frontend" {
  name  = "clinique-frontend"
  image = "fatimazahra004/clinique-frontend:latest"

  ports {
    internal = 80
    external = 3000
  }

  env = [
    "REACT_APP_API_URL=http://backend:8080",
  ]

  networks_advanced {
    name = docker_network.clinique_network.name
  }

  # ⬇️ Dépend du backend
  depends_on = [docker_container.backend]
  restart = "unless-stopped"
}