#!/bin/bash

# Script de démarrage pour la préproduction avec Docker.
echo "🚀 Démarrage de l'environnement de préproduction..."

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

# Arrêter les conteneurs existants.
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.staging.yml down

# Construire les images.
echo "🔨 Construction des images Docker..."
docker-compose -f docker-compose.staging.yml build

# Démarrer les services.
echo "⚙️ Démarrage des services..."
docker-compose -f docker-compose.staging.yml up -d

# Vérifier que les services sont en cours d'exécution.
echo "✅ Services démarrés !"
echo ""
echo "📊 État des conteneurs :"
docker-compose -f docker-compose.staging.yml ps

echo ""
echo "🌐 URLs d'accès :"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   MongoDB: localhost:27017"
echo "   Notifications: http://localhost:4002"
echo "   Stock Management: http://localhost:4003"
echo "   Gateway: http://localhost:8000"
