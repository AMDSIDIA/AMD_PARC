# Guide de Déploiement Complet - AMD Parc Informatique

## Déploiement Automatique Backend + Frontend

Ce guide explique comment déployer automatiquement le backend et le frontend sur Render en utilisant le fichier `render.yaml`.

## Prérequis

- Compte Render.com
- Repository GitHub avec le code
- Les deux services seront déployés automatiquement

## Étapes de Déploiement

### 1. Préparation du Repository

Assurez-vous que votre repository contient :
```
├── render.yaml                    # Configuration Render
├── package.json                   # Frontend
├── app/                          # Frontend Next.js
├── backend/
│   ├── package.json              # Backend
│   └── server.js                 # Serveur Express
└── DEPLOIEMENT_COMPLET.md        # Ce guide
```

### 2. Déploiement sur Render

#### Option A : Déploiement via Blueprint (Recommandé)

1. **Connectez-vous à Render.com**
2. **Cliquez sur "New +"**
3. **Sélectionnez "Blueprint"**
4. **Connectez votre repository GitHub**
5. **Render détectera automatiquement le fichier `render.yaml`**
6. **Cliquez sur "Create New Blueprint Instance"**

#### Option B : Déploiement Manuel

Si le Blueprint ne fonctionne pas, créez les services manuellement :

##### Service Backend
1. **New + → Web Service**
2. **Repository :** Votre repo GitHub
3. **Root Directory :** `backend`
4. **Build Command :** `npm install`
5. **Start Command :** `npm start`
6. **Variables d'environnement :**
   - `NODE_ENV=production`
   - `PORT=10000`

##### Service Frontend
1. **New + → Web Service**
2. **Repository :** Votre repo GitHub
3. **Root Directory :** `.` (racine)
4. **Build Command :** `npm install && npm run build`
5. **Start Command :** `npx serve@latest out --listen $PORT`
6. **Variables d'environnement :**
   - `NODE_ENV=production`
   - `PORT=10001`

### 3. Configuration des URLs

Une fois déployé, vous aurez deux URLs :

- **Backend :** `https://amd-parc-backend.onrender.com`
- **Frontend :** `https://amd-parc-frontend.onrender.com`

### 4. Mise à jour du Frontend

Après le déploiement, vous devrez mettre à jour l'URL du backend dans le frontend :

#### Fichiers à modifier :
- `app/dashboard/page.tsx`
- `app/demande-materiel/page.tsx`
- `app/gestion/page.tsx`
- `app/suivi/page.tsx`
- `app/suivi-demandes/page.tsx`

#### Remplacer :
```javascript
// Ancien
const API_BASE_URL = 'http://localhost:5000';

// Nouveau
const API_BASE_URL = 'https://amd-parc-backend.onrender.com';
```

### 5. Test de l'Application

1. **Testez le backend :**
   ```
   https://amd-parc-backend.onrender.com/api/technicians
   ```

2. **Testez le frontend :**
   ```
   https://amd-parc-frontend.onrender.com
   ```

3. **Testez la connexion :**
   - Ouvrez le frontend
   - Essayez de vous connecter avec les identifiants admin
   - Vérifiez que les données se chargent

## Identifiants de Test

**Administrateur :**
- Email : `pascalouoba5@gmail.com`
- Mot de passe : `admin1234`

**Compte de test :**
- Email : `admin@amd-international.com`
- Mot de passe : `admin123`

## Dépannage

### Problèmes courants :

1. **Erreur de connexion au serveur :**
   - Vérifiez que le backend est déployé et accessible
   - Vérifiez les URLs dans le frontend

2. **Erreur CORS :**
   - Le backend est configuré pour accepter les requêtes du frontend
   - Vérifiez que les URLs sont correctes

3. **Erreur de build :**
   - Vérifiez les logs de build dans Render
   - Assurez-vous que toutes les dépendances sont installées

### Logs utiles :

- **Backend logs :** Dashboard Render → amd-parc-backend → Logs
- **Frontend logs :** Dashboard Render → amd-parc-frontend → Logs

## Maintenance

### Redéploiement automatique :
- Les services se redéploient automatiquement à chaque push sur GitHub
- Vous pouvez aussi redéployer manuellement depuis le dashboard Render

### Variables d'environnement :
- Modifiez les variables depuis le dashboard Render
- Les changements déclenchent un redéploiement automatique

## Support

En cas de problème :
1. Vérifiez les logs dans Render
2. Testez les URLs individuellement
3. Vérifiez la configuration du fichier `render.yaml`
