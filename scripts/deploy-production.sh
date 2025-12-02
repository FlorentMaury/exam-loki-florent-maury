#!/bin/bash

# Script de déploiement pour l'environnement de production.

echo "Déploiement en production..."

# Vérifier que Docker est installé.
if ! command -v docker &> /dev/null; then
    echo "Docker n'est pas installé."
    exit 1
fi

# Vérifier que le fichier .env.production existe.
if [ ! -f .env.production ]; then
    echo "Le fichier .env.production n'existe pas."
    exit 1
fi

# Charger les variables d'environnement.
export $(cat .env.production | xargs)

# Arrêter les anciens conteneurs.
echo "Arrêt des anciens conteneurs..."
docker-compose -f docker-compose.prod.yml down

# Construire les images.
echo "Construction des images..."
docker-compose -f docker-compose.prod.yml build

# Démarrer les services.
echo "Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts.
echo "Attente du démarrage des services..."
sleep 15

# Vérifier la santé des services.
echo "Vérification de l'état des services..."
docker-compose -f docker-compose.prod.yml ps

# Afficher les URLs.
echo ""
echo "URLs d'accès :"
echo "   Frontend: https://exam-loki-florent-maury.vercel.app"
echo "   Backend: https://exam-loki-florent-maury.onrender.com"
echo ""
echo "Déploiement en production réussi."
