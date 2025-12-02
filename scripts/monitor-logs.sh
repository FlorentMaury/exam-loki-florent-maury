#!/bin/bash

# Script simple pour afficher les logs en temps réel.

echo "Surveillance des logs du backend Docker..."
echo ""

# Afficher les logs du backend Docker en temps réel.
docker-compose -f docker-compose.staging.yml logs -f backend 2>/dev/null | while read line; do
    if [[ $line == *"error"* ]] || [[ $line == *"ERROR"* ]] || [[ $line == *"Erreur"* ]]; then
        echo -e "\033[0;31m$line\033[0m"
    elif [[ $line == *"AUDIT"* ]]; then
        echo -e "\033[0;32m$line\033[0m"
    elif [[ $line == *"SECURITY"* ]]; then
        echo -e "\033[0;33m$line\033[0m"
    elif [[ $line == *"info"* ]] || [[ $line == *"success"* ]]; then
        echo -e "\033[0;36m$line\033[0m"
    else
        echo "$line"
    fi
done

