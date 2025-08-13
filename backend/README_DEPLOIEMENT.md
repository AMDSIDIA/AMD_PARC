# Déploiement du Backend AMD Parc Informatique

## Déploiement sur Render

### 1. Créer un nouveau service Web sur Render

1. Connectez-vous à votre compte Render
2. Cliquez sur "New +" puis "Web Service"
3. Connectez votre repository GitHub
4. Sélectionnez le dossier `backend` du repository

### 2. Configuration du service

- **Name:** `amd-parc-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (ou selon vos besoins)

### 3. Variables d'environnement

Ajoutez ces variables d'environnement dans Render :

```
NODE_ENV=production
PORT=10000
```

### 4. Déploiement

1. Cliquez sur "Create Web Service"
2. Attendez que le déploiement se termine
3. Notez l'URL du service (ex: `https://amd-parc-backend.onrender.com`)

### 5. Mise à jour du frontend

Une fois le backend déployé, vous devrez mettre à jour l'URL du backend dans le frontend pour pointer vers l'URL Render au lieu de localhost:5000.

## Test local

Pour tester localement :

```bash
cd backend
npm install
npm start
```

Le serveur sera accessible sur `http://localhost:5000`
