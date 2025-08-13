# Déploiement du projet Parc Informatique (Next.js + Node.js/Express)

Ce guide explique comment déployer le frontend (Next.js) sur **Vercel** et le backend (Node.js/Express) sur **Render**.

---

## 1. Déploiement du Backend sur Render

### a) Préparation
- Placez le dossier `backend` dans un dépôt GitHub séparé (ou dans le même repo, mais le chemin doit être clair).
- Vérifiez que le fichier `package.json` contient bien :
  ```json
  "scripts": {
    "start": "node server.js"
  }
  ```

### b) Création du service Render
1. Créez un compte sur [https://render.com/](https://render.com/)
2. Cliquez sur **New Web Service**
3. Connectez votre repo GitHub contenant le backend
4. Paramétrez :
   - **Root Directory** : `backend` (si le backend est dans un sous-dossier)
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Port** : 5000 (Render détecte automatiquement)
   - **Variables d’environnement** : ajoutez si besoin (ex: `JWT_SECRET`)
5. Lancez le déploiement
6. Notez l’URL Render (ex: `https://parc-informatique-backend.onrender.com`)

---

## 2. Déploiement du Frontend sur Vercel

### a) Préparation
- Placez le dossier Next.js (tout sauf le backend) dans un repo GitHub (ou le même repo, mais le chemin doit être clair).

### b) Création du projet Vercel
1. Créez un compte sur [https://vercel.com/](https://vercel.com/)
2. Cliquez sur **New Project**
3. Importez votre repo GitHub
4. Paramétrez :
   - **Framework** : Next.js (détecté automatiquement)
   - **Root Directory** : racine du frontend (ex: `./`)
   - **Variables d’environnement** :
     - Ajoutez :
       ```
       NEXT_PUBLIC_API_URL=https://parc-informatique-backend.onrender.com
       ```
5. Lancez le déploiement
6. Notez l’URL Vercel (ex: `https://parc-informatique.vercel.app`)

---

## 3. Connexion Frontend/Backend
- Vérifiez que tous les appels API du frontend utilisent bien la variable `NEXT_PUBLIC_API_URL`.
- Exemple dans le code :
  ```js
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  ```

---

## 4. Test et vérification
- Accédez à l’URL Vercel pour le frontend
- Vérifiez que toutes les fonctionnalités (connexion, tickets, inventaire, etc.) fonctionnent et que les appels API vont bien vers Render
- Testez aussi l’API Render directement (ex: `/api/tickets`)

---

## 5. Conseils de sécurité et production
- Changez la valeur du `JWT_SECRET` en production (variable d’environnement sur Render)
- Ne stockez jamais de mot de passe en clair en production (utilisez le hashage si besoin)
- Limitez les CORS si possible
- Sur Vercel, désactivez le mode preview pour la prod

---

## 6. Ressources utiles
- [Déployer Next.js sur Vercel (doc)](https://vercel.com/docs/deploy-projects)
- [Déployer Node.js sur Render (doc)](https://render.com/docs/deploy-node-express-app)
- [Tuto complet Render + Vercel (FR)](https://dev.to/guillaumebriday/deployer-une-app-nextjs-avec-un-backend-express-sur-vercel-et-render-2e5g)

---

**Votre application sera alors accessible partout dans le monde !** 