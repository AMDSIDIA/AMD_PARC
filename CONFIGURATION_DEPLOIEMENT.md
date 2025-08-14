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
- **Host** : dpg-d2efvus9c44c738uqqag-a
- **Nom** : ParcDB
- **Plateforme** : Render (PostgreSQL)

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
DATABASE_URL=postgresql://[user]:[password]@dpg-d2efvus9c44c738uqqag-a/ParcDB
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
1. **app/suivi-demandes/page.tsx** : URL API mise à jour pour utiliser la variable d'environnement
2. **app/signaler/page.tsx** : Déjà configuré pour utiliser la variable d'environnement

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
