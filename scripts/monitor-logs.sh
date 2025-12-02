#!/bin/bash

# Script pour surveiller les logs en temps réel.

LOG_DIR="backend/logs"

# Vérifier que le répertoire existe.
if [ ! -d "$LOG_DIR" ]; then
    echo "❌ Le répertoire $LOG_DIR n'existe pas."
    exit 1
fi

echo "📊 Surveillance des logs en temps réel..."
echo ""
echo "📋 Logs d'accès (HTTP) :"
echo ""

# Afficher les derniers logs en temps réel.
tail -f "$LOG_DIR/combined.log" 2>/dev/null | while read line; do
    if [[ $line == *"error"* ]] || [[ $line == *"ERROR"* ]]; then
        echo -e "\033[0;31m$line\033[0m"  # Rouge pour les erreurs.
    elif [[ $line == *"AUDIT"* ]]; then
        echo -e "\033[0;32m$line\033[0m"  # Vert pour les audits.
    elif [[ $line == *"SECURITY"* ]]; then
        echo -e "\033[0;33m$line\033[0m"  # Jaune pour la sécurité.
    else
        echo "$line"
    fi
done &

# Afficher les logs d'erreur.
echo ""
echo "⚠️ Logs d'erreur :"
echo ""
tail -f "$LOG_DIR/error.log" 2>/dev/null | while read line; do
    echo -e "\033[0;31m$line\033[0m"  # Rouge pour les erreurs.
done &

# Maintenir le script actif.
wait
