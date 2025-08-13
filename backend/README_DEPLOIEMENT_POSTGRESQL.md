# Déploiement du Backend AMD Parc Informatique avec PostgreSQL

## 🗄️ Configuration PostgreSQL sur Render

### 1. Créer une base de données PostgreSQL sur Render

1. Connectez-vous à votre compte Render
2. Cliquez sur "New +" puis "PostgreSQL"
3. Configurez la base de données :
   - **Name:** `amd-parc-db`
   - **Database:** `amd_parc_db`
   - **User:** `amd_parc_user`
   - **Plan:** Free (ou selon vos besoins)

### 2. Créer le service Web Backend

1. Cliquez sur "New +" puis "Web Service"
2. Connectez votre repository GitHub
3. Sélectionnez le dossier `backend` du repository

### 3. Configuration du service Backend

- **Name:** `amd-parc-backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm run db:migrate && npm run db:seed && npm start`
- **Plan:** Free (ou selon vos besoins)

### 4. Variables d'environnement

Ajoutez ces variables d'environnement dans Render :

```
NODE_ENV=production
PORT=10000
JWT_SECRET=amd_support_secret_2024_production!
```

**Important :** La variable `DATABASE_URL` sera automatiquement fournie par Render et connectée à votre base de données PostgreSQL.

### 5. Déploiement

1. Cliquez sur "Create Web Service"
2. Attendez que le déploiement se termine
3. Notez l'URL du service (ex: `https://amd-parc-backend.onrender.com`)

## 🛠️ Test local avec PostgreSQL

### 1. Installation de PostgreSQL local

**Windows :**
- Téléchargez PostgreSQL depuis https://www.postgresql.org/download/windows/
- Installez avec pgAdmin

**macOS :**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu) :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Créer la base de données locale

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE amd_parc_db;
CREATE USER amd_parc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE amd_parc_db TO amd_parc_user;
\q
```

### 3. Configuration locale

Créez un fichier `.env` dans le dossier `backend` :

```env
DATABASE_URL=postgresql://amd_parc_user:your_password@localhost:5432/amd_parc_db
JWT_SECRET=amd_support_secret_2024!
PORT=5000
NODE_ENV=development
```

### 4. Installation et démarrage

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm start
```

Le serveur sera accessible sur `http://localhost:5000`

## 📊 Structure de la base de données

### Tables créées :

1. **users** - Utilisateurs (admins et techniciens)
2. **incidents** - Incidents et tickets
3. **inventory** - Inventaire du matériel

### Commandes utiles :

```bash
# Migration de la base de données
npm run db:migrate

# Peupler avec les données initiales
npm run db:seed

# Redémarrer le serveur
npm start
```

## 🔍 Vérification du déploiement

### Test de la base de données :

```bash
# Test de connexion
curl https://amd-parc-backend.onrender.com/api/health

# Test des techniciens
curl https://amd-parc-backend.onrender.com/api/technicians

# Test de l'inventaire
curl https://amd-parc-backend.onrender.com/api/inventory
```

## 🚨 Dépannage

### Problèmes courants :

1. **Erreur de connexion à la base de données :**
   - Vérifiez que la variable `DATABASE_URL` est correcte
   - Vérifiez que la base de données PostgreSQL est active sur Render

2. **Erreur de migration :**
   - Vérifiez les logs de déploiement dans Render
   - Assurez-vous que les scripts de migration s'exécutent correctement

3. **Erreur de seeding :**
   - Vérifiez que les tables existent avant le seeding
   - Vérifiez les contraintes d'unicité

### Logs utiles :

- **Backend logs :** Dashboard Render → amd-parc-backend → Logs
- **Database logs :** Dashboard Render → amd-parc-db → Logs

## 🔄 Migration depuis l'ancienne version

Si vous migrez depuis la version avec base de données en mémoire :

1. Les données existantes ne seront pas migrées automatiquement
2. Utilisez le script de seeding pour recréer les données initiales
3. Les nouveaux incidents seront sauvegardés dans PostgreSQL

## 📈 Avantages de PostgreSQL

- ✅ **Persistance des données** - Les données ne sont plus perdues au redémarrage
- ✅ **Sécurité** - Gestion des utilisateurs et permissions
- ✅ **Performance** - Requêtes optimisées et indexation
- ✅ **Scalabilité** - Support de grandes quantités de données
- ✅ **Backup automatique** - Sauvegarde automatique sur Render
