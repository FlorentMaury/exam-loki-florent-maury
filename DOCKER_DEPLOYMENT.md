# Guide de déploiement Docker - Préproduction et Production

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- git

## 🏗️ Architecture

L'application est conteneurisée en 6 services :

1. **Frontend** - React avec Nginx (port 3000)
2. **Backend** - Express.js (port 5000)
3. **MongoDB** - Base de données (port 27017)
4. **Notifications** - Microservice (port 4002)
5. **Stock Management** - Microservice (port 4003)
6. **Gateway** - API Gateway (port 8000)

## 🚀 Déploiement en Préproduction

### Avec Docker Compose (Staging)

```bash
# Charger les variables d'environnement.
export $(cat .env.staging | xargs)

# Démarrer les services.
docker-compose -f docker-compose.staging.yml up -d

# Vérifier l'état.
docker-compose -f docker-compose.staging.yml ps

# Voir les logs.
docker-compose -f docker-compose.staging.yml logs -f

# Arrêter les services.
docker-compose -f docker-compose.staging.yml down
```

### Ou utiliser le script de démarrage

```bash
chmod +x start-staging.sh
./start-staging.sh
```

### Accès aux services en préproduction

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **MongoDB** : localhost:27017
- **Notifications** : http://localhost:4002
- **Stock Management** : http://localhost:4003
- **Gateway** : http://localhost:8000

## 🌐 Déploiement en Production

### Configuration requise

1. Créer le fichier `.env.production` avec les vraies valeurs :

```bash
cp .env.production .env.production.local
# Éditer .env.production.local avec les vraies valeurs
```

2. Vérifier que les secrets sont définis :

```bash
MONGO_USER=admin
MONGO_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://exam-loki-florent-maury.vercel.app
REACT_APP_API_URL=https://exam-loki-florent-maury.onrender.com/api
```

### Démarrage en production

```bash
# Charger les variables d'environnement.
export $(cat .env.production | xargs)

# Construire les images.
docker-compose -f docker-compose.prod.yml build

# Démarrer les services.
docker-compose -f docker-compose.prod.yml up -d

# Vérifier l'état.
docker-compose -f docker-compose.prod.yml ps

# Voir les logs.
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Ou utiliser le script de démarrage

```bash
chmod +x start-production.sh
./start-production.sh
```

## 🔒 Sécurité en Production

1. **MongoDB** - Authentification activée (MONGO_USER, MONGO_PASSWORD)
2. **JWT** - Secret robuste défini via .env.production
3. **Nginx** - Headers de sécurité ajoutés (X-Frame-Options, CSP, etc.)
4. **Logs** - Limités à 10MB par fichier avec 3 fichiers max
5. **Healthchecks** - Vérifications régulières de la santé des services
6. **Restart Policy** - Services redémarrés automatiquement en cas d'erreur

## 📊 Monitoring et Logs

### Voir les logs d'un service

```bash
# Backend.
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend.
docker-compose -f docker-compose.prod.yml logs -f frontend

# MongoDB.
docker-compose -f docker-compose.prod.yml logs -f mongo
```

### Accéder à MongoDB en production

```bash
docker-compose -f docker-compose.prod.yml exec mongo mongosh -u admin -p password
```

### Vérifier la santé des services

```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔄 Mise à jour des images en production

```bash
# Reconstruire les images.
docker-compose -f docker-compose.prod.yml build

# Redémarrer les services.
docker-compose -f docker-compose.prod.yml up -d

# Vérifier l'état.
docker-compose -f docker-compose.prod.yml ps
```

## 🗑️ Nettoyage

```bash
# Arrêter et supprimer les conteneurs.
docker-compose -f docker-compose.prod.yml down

# Supprimer les volumes.
docker-compose -f docker-compose.prod.yml down -v

# Nettoyer les images non utilisées.
docker image prune -a
```

## 📝 Structure des fichiers

- `Dockerfile.backend` - Image Docker pour le backend.
- `Dockerfile.frontend` - Image Docker pour le frontend.
- `Dockerfile.microservice` - Image Docker générique pour les microservices.
- `docker-compose.staging.yml` - Configuration préproduction.
- `docker-compose.prod.yml` - Configuration production.
- `nginx.conf` - Configuration Nginx pour le frontend.
- `.env.staging` - Variables d'environnement préproduction.
- `.env.production` - Variables d'environnement production.
- `start-staging.sh` - Script de démarrage préproduction.
- `start-production.sh` - Script de démarrage production.

## ✅ Checklist de déploiement

### Avant le déploiement en préproduction

- [ ] Les fichiers Dockerfile sont créés
- [ ] Le docker-compose.staging.yml est configuré
- [ ] Les variables d'environnement sont définies dans .env.staging
- [ ] Les tests locaux passent

### Avant le déploiement en production

- [ ] Les secrets dans .env.production sont définis
- [ ] MongoDB avec authentification est configuré
- [ ] Les healthchecks fonctionnent
- [ ] Les logs sont configurés correctement
- [ ] Les volumes de sauvegarde MongoDB sont en place
- [ ] Les images sont tagguées avec les numéros de version

## 🚨 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs.
docker-compose -f docker-compose.prod.yml logs

# Reconstruire les images.
docker-compose -f docker-compose.prod.yml build --no-cache
```

### MongoDB ne se connecte pas

```bash
# Vérifier les credentials.
docker-compose -f docker-compose.prod.yml exec mongo mongosh -u admin -p password

# Vérifier la connectivité réseau.
docker network ls
docker network inspect exam_network_prod
```

### Le frontend ne charge pas le CSS

```bash
# Vérifier les fichiers dans Nginx.
docker-compose -f docker-compose.prod.yml exec frontend ls -la /usr/share/nginx/html

# Redémarrer Nginx.
docker-compose -f docker-compose.prod.yml restart frontend
```
