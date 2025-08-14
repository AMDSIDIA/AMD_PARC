# Configuration de Déploiement AMD Parc Informatique

## URLs de Production

### Frontend
- **URL** : https://amd-parc.onrender.com
- **Plateforme** : Render (Frontend)

### Backend
- **URL** : https://amd-parc-backend.onrender.com
- **Plateforme** : Render (Backend)

### Base de Données
- **Type** : PostgreSQL
- **Host** : dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com
- **Nom** : parcdb_gkw5
- **Plateforme** : Render (PostgreSQL)
- **SSL** : Requis (require: true, rejectUnauthorized: false)

## Configuration des Variables d'Environnement

### Frontend (.env)
```env
# URL du backend déployé sur Render
NEXT_PUBLIC_API_URL=https://amd-parc-backend.onrender.com

# URL de développement local (pour les tests)
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (Variables Render)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://parcdb_gkw5_user:pUPYo0OFAt57tmGdVpCLHw7j81iyzrL9@dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com/parcdb_gkw5
JWT_SECRET=amd_support_secret_2024!
```

## Configuration CORS

Le backend est configuré pour accepter les requêtes depuis :
- `http://localhost:3000` (développement local)
- `https://amd-parc.onrender.com` (production)
- `https://amd-parc-frontend.onrender.com` (alternative)

## Points de Vérification

### ✅ Configuration Validée
1. **Base de données** : Configuration PostgreSQL correcte
2. **CORS** : Frontend autorisé dans la configuration backend
3. **Variables d'environnement** : URLs de production configurées
4. **SSL** : Configuration SSL pour la production

### 🔧 Corrections Appliquées
1. **backend/server.js** : Port par défaut changé de 5000 à 10000
2. **backend/config/database.js** : Configuration SSL mise à jour pour Render
3. **app/suivi-demandes/page.tsx** : URL API mise à jour pour utiliser la variable d'environnement
4. **app/signaler/page.tsx** : URL API mise à jour pour utiliser la variable d'environnement
5. **app/config/api.ts** : Configuration centralisée de l'API créée

## Test de Connexion

### Backend
```bash
curl https://amd-parc-backend.onrender.com/api/health
```

### Frontend
```bash
curl https://amd-parc.onrender.com
```

## Déploiement Local (Développement)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
npm install
npm run dev
```

## Monitoring

- **Frontend** : Accessible via https://amd-parc.onrender.com
- **Backend** : Accessible via https://amd-parc-backend.onrender.com
- **Base de données** : Gérée automatiquement par Render PostgreSQL

## Support

Pour toute question ou problème :
- **Email** : pascalouoba5@gmail.com
- **Téléphone** : +226 65494389 (incidents) / +226 65186681 (matériel)
- **Horaires** : Lun-Ven: 8h-18h
