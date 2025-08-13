# AMD International - Parc Informatique

Système de gestion du parc informatique pour AMD International avec signalement d'incidents, suivi des demandes et gestion technique.

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation du Frontend

1. Installer les dépendances :
```bash
npm install
```

2. Créer le fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Démarrer le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### Installation du Backend

1. Aller dans le dossier backend :
```bash
cd backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Démarrer le serveur backend :
```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

## 📋 Fonctionnalités

### 🔧 Page de Signalement (`/signaler`)
- Formulaire complet pour signaler un problème technique
- Validation des champs obligatoires
- Envoi des données au backend
- Confirmation avec numéro de ticket

### 📊 Page de Suivi (`/suivi`)
- Affichage de tous les tickets en cours
- Filtrage par statut et priorité
- Recherche de tickets
- Gestion des utilisateurs (connexion/déconnexion)
- Interface d'administration pour les comptes

### ⚙️ Page de Gestion Technique (`/gestion`)
- **Onglet Gestion des Incidents** :
  - Liste des incidents
  - Attribution aux techniciens
  - Mise à jour des statuts
- **Onglet Gestion de l'Inventaire** :
  - Liste du matériel
  - Ajout de nouveaux équipements
  - Suivi de l'état du matériel

## 🔌 API Backend

### Routes principales :
- `POST /api/incidents` - Créer un incident
- `GET /api/incidents` - Récupérer tous les incidents
- `PATCH /api/incidents/:ticketId/assign` - Assigner un incident
- `PATCH /api/incidents/:ticketId/status` - Mettre à jour le statut
- `GET /api/tickets` - Récupérer les tickets pour le suivi
- `GET /api/technicians` - Récupérer la liste des techniciens
- `GET /api/inventory` - Récupérer l'inventaire
- `POST /api/inventory` - Ajouter un équipement
- `POST /api/auth/login` - Authentification

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **React Hooks** - Gestion d'état

### Backend
- **Express.js** - Serveur web
- **JWT** - Authentification
- **CORS** - Gestion des requêtes cross-origin
- **Body-parser** - Parsing des requêtes

## 📁 Structure du projet

```
parc-informatique/
├── app/                    # Pages Next.js
│   ├── signaler/          # Page de signalement
│   ├── suivi/             # Page de suivi
│   └── gestion/           # Page de gestion technique
├── components/            # Composants React
│   ├── IncidentManagement.tsx
│   └── InventoryManagement.tsx
├── backend/               # Serveur Express
│   ├── server.js         # Serveur principal
│   └── package.json      # Dépendances backend
├── parc/                  # Documentation et spécifications
└── package.json          # Dépendances frontend
```

## 🔐 Authentification

Le système utilise JWT pour l'authentification des techniciens. Les routes protégées nécessitent un token valide dans le header `Authorization: Bearer <token>`.

### Techniciens par défaut :
- Alice Dubois (alice.d@amd.com)
- Bob Martin (bob.m@amd.com)
- Charles Petit (charles.p@amd.com)

## 🚀 Déploiement

### Frontend (Vercel)
```bash
npm run build
```

### Backend (Heroku/Railway)
```bash
cd backend
npm start
```

## 📝 Notes

- Les données sont stockées en mémoire (redémarrage = perte des données)
- Pour la production, implémenter une base de données (MongoDB, PostgreSQL)
- Changer le secret JWT en production
- Ajouter des logs et monitoring
- Implémenter la validation côté serveur
- Ajouter des tests unitaires et d'intégration

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
