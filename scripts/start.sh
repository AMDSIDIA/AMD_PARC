#!/bin/sh

# Script de démarrage pour AMD Parc Informatique
# Démarre le backend et le frontend

set -e

echo "🚀 Démarrage d'AMD Parc Informatique..."

# Fonction pour démarrer le backend
start_backend() {
    echo "📡 Démarrage du backend..."
    cd /app/backend
    
    # Vérifier que les variables d'environnement sont définies
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ ERREUR: DATABASE_URL n'est pas définie"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        echo "❌ ERREUR: JWT_SECRET n'est pas définie"
        exit 1
    fi
    
    # Exécuter les migrations si nécessaire
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        echo "🔄 Exécution des migrations..."
        npm run db:migrate
    fi
    
    # Exécuter le seeding si nécessaire
    if [ "$RUN_SEEDING" = "true" ]; then
        echo "🌱 Exécution du seeding..."
        npm run db:seed
    fi
    
    # Démarrer le serveur backend
    echo "✅ Backend démarré sur le port $PORT"
    exec npm start
}

# Fonction pour démarrer le frontend
start_frontend() {
    echo "🌐 Démarrage du frontend..."
    cd /app
    
    # Vérifier que l'URL de l'API est définie
    if [ -z "$NEXT_PUBLIC_API_URL" ]; then
        echo "⚠️  AVERTISSEMENT: NEXT_PUBLIC_API_URL n'est pas définie"
        echo "   Utilisation de l'URL par défaut: https://api.amd-parc.blueprint.com"
        export NEXT_PUBLIC_API_URL="https://api.amd-parc.blueprint.com"
    fi
    
    # Démarrer le serveur frontend
    echo "✅ Frontend démarré sur le port 3000"
    exec npx serve@latest out --listen 3000
}

# Fonction pour démarrer les deux services
start_both() {
    echo "🔄 Démarrage des deux services..."
    
    # Démarrer le backend en arrière-plan
    start_backend &
    BACKEND_PID=$!
    
    # Attendre que le backend soit prêt
    echo "⏳ Attente du démarrage du backend..."
    sleep 10
    
    # Vérifier que le backend répond
    if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
        echo "✅ Backend prêt"
    else
        echo "❌ Backend ne répond pas"
        exit 1
    fi
    
    # Démarrer le frontend
    start_frontend &
    FRONTEND_PID=$!
    
    # Attendre que les deux processus se terminent
    wait $BACKEND_PID $FRONTEND_PID
}

# Gestion des signaux
trap 'echo "🛑 Arrêt des services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' TERM INT

# Déterminer quel service démarrer
case "$SERVICE_TYPE" in
    "backend")
        start_backend
        ;;
    "frontend")
        start_frontend
        ;;
    "both"|"")
        start_both
        ;;
    *)
        echo "❌ ERREUR: SERVICE_TYPE invalide: $SERVICE_TYPE"
        echo "   Valeurs acceptées: backend, frontend, both"
        exit 1
        ;;
esac
