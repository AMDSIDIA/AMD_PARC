# Guide de Déploiement Render - AMD Parc Informatique

## Problème Identifié

L'URL `https://amd-parc-backend.onrender.com` pointe actuellement vers le frontend au lieu du backend. Cela indique que le service backend n'est pas correctement déployé sur Render.

## Solution : Déploiement Manuel sur Render

### 1. Déploiement du Backend

#### Étape 1 : Créer un nouveau service Web sur Render

1. Connectez-vous à votre compte Render (https://render.com)
2. Cliquez sur "New +" puis "Web Service"
3. Connectez votre repository GitHub
4. **IMPORTANT** : Sélectionnez le dossier `backend` du repository (pas la racine)

#### Étape 2 : Configuration du service backend

- **Name:** `amd-parc-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (ou selon vos besoins)

#### Étape 3 : Variables d'environnement pour le backend

Ajoutez ces variables d'environnement dans Render :

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=amd_support_secret_2024_production!
DATABASE_URL=postgresql://parcdb_gkw5_user:pUPYo0OFAt57tmGdVpCLHw7j81iyzrL9@dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com/parcdb_gkw5
```

#### Étape 4 : Déploiement

1. Cliquez sur "Create Web Service"
2. Attendez que le déploiement se termine
3. Notez l'URL du service (ex: `https://amd-parc-backend.onrender.com`)

### 2. Déploiement du Frontend

#### Étape 1 : Créer un nouveau service Web sur Render

1. Cliquez sur "New +" puis "Web Service"
2. Connectez votre repository GitHub
3. Sélectionnez la racine du repository (pas le dossier backend)

#### Étape 2 : Configuration du service frontend

- **Name:** `amd-parc-frontend`
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve@latest out --listen $PORT`
- **Plan:** Free (ou selon vos besoins)

#### Étape 3 : Variables d'environnement pour le frontend

```env
NODE_ENV=production
PORT=10001
NEXT_PUBLIC_API_URL=https://amd-parc-backend.onrender.com
```

### 3. Configuration de la Base de Données

#### Étape 1 : Créer une base de données PostgreSQL

1. Cliquez sur "New +" puis "PostgreSQL"
2. **Name:** `amd-parc-db`
3. **Database:** `parcdb_gkw5`
4. **User:** `parcdb_gkw5_user`
5. **Plan:** Free

#### Étape 2 : Récupérer les informations de connexion

Une fois créée, notez :
- **Host:** `dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com`
- **Database:** `parcdb_gkw5`
- **User:** `parcdb_gkw5_user`
- **Password:** (généré automatiquement)

### 4. Migration et Seeding de la Base de Données

#### Étape 1 : Exécuter les migrations

Une fois le backend déployé, exécutez les migrations :

```bash
# Via le dashboard Render ou en local
cd backend
npm run db:migrate
```

#### Étape 2 : Seeding des données

```bash
npm run db:seed
```

### 5. Test de Connexion

#### Test du Backend

```bash
# Test de santé
curl https://amd-parc-backend.onrender.com/api/health

# Test des tickets
curl https://amd-parc-backend.onrender.com/api/tickets

# Test des techniciens
curl https://amd-parc-backend.onrender.com/api/technicians
```

#### Test du Frontend

1. Visitez `https://amd-parc-frontend.onrender.com`
2. Vérifiez que les appels API fonctionnent
3. Testez la création d'un ticket

### 6. Configuration CORS

Le backend est déjà configuré pour accepter les requêtes depuis :
- `http://localhost:3000` (développement local)
- `https://amd-parc.onrender.com` (production actuelle)
- `https://amd-parc-frontend.onrender.com` (nouveau frontend)

### 7. Variables d'Environnement Finales

#### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://parcdb_gkw5_user:[PASSWORD]@dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com/parcdb_gkw5
JWT_SECRET=amd_support_secret_2024_production!
```

#### Frontend (.env)
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://amd-parc-backend.onrender.com
```

### 8. URLs Finales

- **Frontend:** `https://amd-parc-frontend.onrender.com`
- **Backend:** `https://amd-parc-backend.onrender.com`
- **Base de données:** PostgreSQL sur Render

### 9. Monitoring et Debugging

#### Logs Render

1. Accédez au dashboard Render
2. Sélectionnez votre service
3. Cliquez sur "Logs" pour voir les logs en temps réel

#### Test de Connectivité

Utilisez le script de test créé :

```bash
node test-backend-render.js
```

### 10. Problèmes Courants

#### Backend ne répond pas
- Vérifiez que le service est déployé dans le bon dossier (`backend`)
- Vérifiez les variables d'environnement
- Vérifiez les logs Render

#### Erreurs de base de données
- Vérifiez la variable `DATABASE_URL`
- Vérifiez que la base de données est créée
- Vérifiez que les migrations sont exécutées

#### Erreurs CORS
- Vérifiez la configuration CORS dans `server.js`
- Vérifiez que l'URL du frontend est autorisée

## Support

Pour toute question ou problème :
- **Email:** pascalouoba5@gmail.com
- **Téléphone:** +226 65494389 (incidents) / +226 65186681 (matériel)
- **Horaires:** Lun-Ven: 8h-18h
