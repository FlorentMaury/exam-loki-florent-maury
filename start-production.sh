#!/bin/bash

# Script de démarrage pour la production avec Docker.
echo "🚀 Démarrage de l'environnement de production..."

# Vérifier que Docker est installé.
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

# Vérifier que Docker Compose est installé.
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose."
    exit 1
fi

# Charger les variables d'environnement.
if [ ! -f .env.production ]; then
    echo "❌ Le fichier .env.production n'existe pas. Veuillez le créer."
    exit 1
fi

# Arrêter les conteneurs existants.
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Construire les images.
echo "🔨 Construction des images Docker..."
docker-compose -f docker-compose.prod.yml build

# Démarrer les services.
echo "⚙️ Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Vérifier que les services sont en cours d'exécution.
echo "✅ Services démarrés !"
echo ""
echo "📊 État des conteneurs :"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Logs des services :"
docker-compose -f docker-compose.prod.yml logs -f
