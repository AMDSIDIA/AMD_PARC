# 🔧 Résolution de l'erreur "Failed to fetch"

## Problème
L'erreur "Failed to fetch" indique que le frontend ne peut pas se connecter au backend sur `http://localhost:5000`.

## Solution

### Option 1 : Utiliser les scripts batch (Recommandé)

1. **Démarrer le backend :**
   ```bash
   # Double-cliquez sur le fichier
   start-backend.bat
   ```
   Ou en ligne de commande :
   ```bash
   start-backend.bat
   ```

2. **Démarrer le frontend :**
   ```bash
   # Double-cliquez sur le fichier
   start-frontend.bat
   ```
   Ou en ligne de commande :
   ```bash
   start-frontend.bat
   ```

### Option 2 : Démarrage manuel

1. **Démarrer le backend :**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Démarrer le frontend (dans un nouveau terminal) :**
   ```bash
   npm install
   npm run dev
   ```

### Option 3 : Utiliser le script unifié

```bash
# Double-cliquez sur le fichier
start.bat
```

## Vérification

1. **Backend :** Vérifiez que le serveur backend est accessible sur `http://localhost:5000`
2. **Frontend :** Vérifiez que le frontend est accessible sur `http://localhost:3000`
3. **Test de connexion :** Ouvrez `test-backend.html` dans votre navigateur

## Diagnostic

Si le problème persiste :

1. **Vérifier les ports :**
   - Port 5000 : Backend
   - Port 3000 : Frontend

2. **Vérifier les logs :**
   - Regardez les messages dans les fenêtres de terminal
   - Vérifiez les erreurs dans la console du navigateur (F12)

3. **Redémarrer les services :**
   - Fermez tous les terminaux
   - Relancez les scripts

## Messages d'erreur courants

- **"Failed to fetch"** : Backend non démarré
- **"ECONNREFUSED"** : Port 5000 occupé ou bloqué
- **"Module not found"** : Dépendances non installées

## Support

Si le problème persiste, vérifiez :
1. Node.js est installé (version 16+)
2. Aucun autre service n'utilise les ports 3000 et 5000
3. Le pare-feu Windows n'empêche pas les connexions 