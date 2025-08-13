# Mise à Jour des URLs du Backend

## Problème résolu

Les nouveaux utilisateurs ne pouvaient pas se connecter car l'application frontend essayait de se connecter au backend sur `localhost:5000` au lieu de l'URL du backend déployé sur Render.

## Changements effectués

### 1. Configuration centralisée des URLs

Toutes les URLs du backend ont été mises à jour pour utiliser une variable d'environnement :

```javascript
// Avant
const API_BASE_URL = 'http://localhost:5000';

// Maintenant
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://amd-parc-backend.onrender.com';
```

### 2. Fichiers modifiés

Les fichiers suivants ont été mis à jour :

- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/demande-materiel/page.tsx`
- `app/suivi/page.tsx`
- `app/suivi-demandes/page.tsx`
- `app/gestion/page.tsx`
- `app/signaler/page.tsx`

### 3. Configuration Render

Le fichier `render.yaml` a été mis à jour pour inclure la variable d'environnement :

```yaml
envVars:
  - key: NEXT_PUBLIC_API_URL
    value: https://amd-parc-backend.onrender.com
```

### 4. Messages d'erreur mis à jour

Les messages d'erreur ont été modifiés pour être plus génériques :

```javascript
// Avant
alert('Erreur de connexion au serveur. Veuillez vérifier que le backend est démarré sur http://localhost:5000');

// Maintenant
alert('Erreur de connexion au serveur. Veuillez vérifier que le backend est accessible.');
```

## Avantages de cette solution

### ✅ **Flexibilité**
- L'URL du backend peut être changée via une variable d'environnement
- Pas besoin de modifier le code pour changer l'URL

### ✅ **Environnements multiples**
- Développement local : `http://localhost:5000`
- Production : `https://amd-parc-backend.onrender.com`

### ✅ **Déploiement automatique**
- La variable d'environnement est configurée automatiquement dans Render
- Pas de configuration manuelle nécessaire

### ✅ **Maintenance simplifiée**
- Un seul endroit pour changer l'URL du backend
- Moins d'erreurs de configuration

## Test de la solution

### 1. Test local
```bash
# Démarrez le backend local
cd backend
npm start

# Dans un autre terminal, démarrez le frontend
npm run dev
```

### 2. Test en production
- Déployez avec le fichier `render.yaml` mis à jour
- L'application devrait maintenant se connecter au backend Render

## Identifiants de test

**Administrateur :**
- Email : `pascalouoba5@gmail.com`
- Mot de passe : `admin1234`

**Compte de test :**
- Email : `admin@amd-international.com`
- Mot de passe : `admin123`

## Prochaines étapes

1. **Poussez ces changements** vers votre repository GitHub
2. **Déployez avec le Blueprint Render** (le fichier `render.yaml` mis à jour)
3. **Testez la connexion** avec les identifiants fournis
4. **Vérifiez que les nouvelles inscriptions** fonctionnent correctement

## Dépannage

Si vous rencontrez encore des problèmes :

1. **Vérifiez que le backend est déployé** sur Render
2. **Vérifiez les logs** dans le dashboard Render
3. **Testez l'URL du backend** directement : `https://amd-parc-backend.onrender.com/api/technicians`
4. **Vérifiez que la variable d'environnement** est bien configurée dans Render

## Support

En cas de problème persistant :
1. Vérifiez les logs de build et de déploiement dans Render
2. Testez les URLs individuellement
3. Vérifiez la configuration CORS dans le backend
