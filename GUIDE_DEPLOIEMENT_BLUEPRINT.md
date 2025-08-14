# Guide de Déploiement Blueprint - AMD Parc Informatique

## 🚀 Qu'est-ce que Blueprint ?

Blueprint est une plateforme de déploiement moderne qui simplifie le déploiement d'applications en offrant :

- **Déploiement automatique** depuis Git
- **Gestion des conteneurs** avec Docker
- **Base de données gérées** (PostgreSQL, MySQL, etc.)
- **SSL automatique** avec Let's Encrypt
- **Monitoring intégré** et alertes
- **Scaling automatique** basé sur la charge
- **Backups automatiques** de la base de données
- **Rollback automatique** en cas de problème

## 📋 Prérequis

### 1. Compte Blueprint
- Créez un compte sur [blueprint.com](https://blueprint.com)
- Vérifiez votre email

### 2. Repository Git
- Votre code doit être dans un repository Git (GitHub, GitLab, Bitbucket)
- Le repository doit être public ou vous devez configurer l'accès

### 3. Variables d'Environnement
Préparez ces variables pour le déploiement :
```env
GIT_REPOSITORY=https://github.com/votre-username/amd-parc-informatique
JWT_SECRET=votre_secret_jwt_tres_securise_2024
DB_PASSWORD=mot_de_passe_base_donnees_securise
```

## 🔧 Configuration de l'Application

### 1. Fichiers de Configuration Créés

✅ **blueprint.yaml** - Configuration principale de Blueprint
✅ **Dockerfile** - Configuration Docker optimisée
✅ **scripts/start.sh** - Script de démarrage
✅ **.dockerignore** - Optimisation du build

### 2. Mise à Jour des URLs

L'application est configurée pour utiliser les URLs Blueprint :
- **Frontend** : `https://amd-parc.blueprint.com`
- **Backend** : `https://api.amd-parc.blueprint.com`

## 🚀 Processus de Déploiement

### Étape 1 : Connexion à Blueprint

1. Connectez-vous à votre compte Blueprint
2. Cliquez sur "New Project"
3. Sélectionnez "From Git Repository"

### Étape 2 : Configuration du Repository

1. **Connectez votre repository Git**
   - Choisissez votre provider (GitHub, GitLab, etc.)
   - Autorisez l'accès à votre repository
   - Sélectionnez le repository `amd-parc-informatique`

2. **Configuration du projet**
   - **Nom** : `amd-parc-informatique`
   - **Description** : `Système de gestion du parc informatique AMD International`
   - **Framework** : `Custom` (nous utilisons notre propre configuration)

### Étape 3 : Configuration des Variables d'Environnement

Dans l'interface Blueprint, configurez ces variables :

```env
# Variables requises
GIT_REPOSITORY=https://github.com/votre-username/amd-parc-informatique
JWT_SECRET=votre_secret_jwt_tres_securise_2024
DB_PASSWORD=mot_de_passe_base_donnees_securise

# Variables optionnelles
NODE_ENV=production
RUN_MIGRATIONS=true
RUN_SEEDING=true
```

### Étape 4 : Configuration des Services

Blueprint détectera automatiquement les services depuis `blueprint.yaml` :

#### Service Backend
- **Type** : Node.js
- **Port** : 10000
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Health Check** : `/api/health`

#### Service Frontend
- **Type** : Node.js
- **Port** : 3000
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npx serve@latest out --listen $PORT`
- **Health Check** : `/`

#### Base de Données PostgreSQL
- **Version** : 15
- **Storage** : 10Gi
- **Backups** : Automatiques (quotidien)

### Étape 5 : Configuration des Domaines

Blueprint configurera automatiquement :
- **Frontend** : `https://amd-parc.blueprint.com`
- **Backend** : `https://api.amd-parc.blueprint.com`
- **SSL** : Automatique avec Let's Encrypt

### Étape 6 : Déploiement

1. Cliquez sur "Deploy"
2. Blueprint va :
   - Cloner votre repository
   - Construire l'image Docker
   - Déployer les services
   - Configurer la base de données
   - Configurer les domaines et SSL

## 🔍 Monitoring et Debugging

### Logs en Temps Réel

1. Accédez à votre projet dans Blueprint
2. Cliquez sur "Logs" pour voir les logs en temps réel
3. Filtrez par service (backend, frontend, database)

### Métriques

Blueprint fournit automatiquement :
- **CPU Usage** : Utilisation du processeur
- **Memory Usage** : Utilisation de la mémoire
- **Disk Usage** : Utilisation du disque
- **Network I/O** : Trafic réseau

### Alertes

Les alertes sont configurées automatiquement :
- **High CPU** : > 80% pendant 5 minutes
- **High Memory** : > 85% pendant 5 minutes

## 🔄 Gestion des Déploiements

### Déploiement Automatique

- **Trigger** : Push sur la branche `main`
- **Build** : Automatique avec Docker
- **Deployment** : Rolling update (zéro downtime)
- **Health Check** : Vérification avant activation

### Rollback

En cas de problème :
1. Accédez à "Deployments" dans Blueprint
2. Cliquez sur "Rollback" sur la version précédente
3. Le rollback est automatique si le health check échoue

### Variables d'Environnement

Pour modifier les variables :
1. Allez dans "Settings" > "Environment Variables"
2. Modifiez les valeurs
3. Cliquez sur "Redeploy"

## 🗄️ Base de Données

### Configuration Automatique

Blueprint configure automatiquement :
- **Base de données** : PostgreSQL 15
- **Utilisateur** : `parcdb_gkw5_user`
- **Base** : `parcdb_gkw5`
- **Connexion** : SSL requis

### Migrations et Seeding

Les migrations s'exécutent automatiquement si :
```env
RUN_MIGRATIONS=true
RUN_SEEDING=true
```

### Backups

- **Fréquence** : Quotidien à 2h du matin
- **Rétention** : 30 jours
- **Compression** : Activée
- **Restauration** : Via l'interface Blueprint

## 🔒 Sécurité

### SSL/TLS
- **Certificats** : Let's Encrypt automatiques
- **Renouvellement** : Automatique
- **HTTPS** : Forcé sur tous les domaines

### Headers de Sécurité
- **X-Frame-Options** : DENY
- **X-Content-Type-Options** : nosniff
- **X-XSS-Protection** : 1; mode=block

### CORS
Configuré pour accepter uniquement :
- `https://amd-parc.blueprint.com`
- `https://api.amd-parc.blueprint.com`
- `http://localhost:3000` (développement)

## 📊 Scaling

### Scaling Automatique

- **Backend** : 1-3 instances selon la charge
- **Frontend** : 1-2 instances selon la charge
- **Base de données** : Scaling vertical automatique

### Métriques de Scaling

- **CPU** : > 70% déclenche le scaling
- **Memory** : > 80% déclenche le scaling
- **Response Time** : > 2s déclenche le scaling

## 🛠️ Maintenance

### Mises à Jour

1. **Code** : Push sur `main` déclenche le déploiement
2. **Dépendances** : Mise à jour automatique des images de base
3. **Sécurité** : Patches automatiques

### Monitoring

- **Uptime** : Surveillance 24/7
- **Performance** : Métriques en temps réel
- **Erreurs** : Alertes automatiques

## 🔧 Commandes Utiles

### Via l'Interface Blueprint

```bash
# Voir les logs
blueprint logs --service backend

# Redémarrer un service
blueprint restart --service frontend

# Voir les métriques
blueprint metrics --service backend

# Exécuter une commande dans un conteneur
blueprint exec --service backend --command "npm run db:migrate"
```

### Via l'API Blueprint

```bash
# Obtenir le statut des services
curl -H "Authorization: Bearer $BLUEPRINT_TOKEN" \
  https://api.blueprint.com/v1/projects/amd-parc-informatique/services

# Déclencher un déploiement
curl -X POST -H "Authorization: Bearer $BLUEPRINT_TOKEN" \
  https://api.blueprint.com/v1/projects/amd-parc-informatique/deploy
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. Build Échoue
```bash
# Vérifier les logs de build
blueprint logs --service backend --build

# Vérifier la configuration Docker
docker build -t test .
```

#### 2. Service Ne Démarre Pas
```bash
# Vérifier les variables d'environnement
blueprint env --service backend

# Vérifier les logs de démarrage
blueprint logs --service backend --tail 100
```

#### 3. Base de Données Non Accessible
```bash
# Vérifier la connexion
blueprint exec --service backend --command "npm run db:test"

# Vérifier les variables de connexion
blueprint env --service database
```

#### 4. Domaines Non Accessibles
```bash
# Vérifier la configuration DNS
nslookup amd-parc.blueprint.com

# Vérifier les certificats SSL
openssl s_client -connect amd-parc.blueprint.com:443
```

## 📞 Support

### Support Blueprint
- **Documentation** : [docs.blueprint.com](https://docs.blueprint.com)
- **Support** : Via l'interface Blueprint
- **Status** : [status.blueprint.com](https://status.blueprint.com)

### Support AMD International
- **Email** : pascalouoba5@gmail.com
- **Téléphone** : +226 65494389 (incidents) / +226 65186681 (matériel)
- **Horaires** : Lun-Ven: 8h-18h

## 🎯 URLs Finales

Après le déploiement :
- **Frontend** : https://amd-parc.blueprint.com
- **Backend** : https://api.amd-parc.blueprint.com
- **Dashboard** : https://blueprint.com/dashboard/amd-parc-informatique

## ✅ Checklist de Déploiement

- [ ] Repository Git configuré
- [ ] Variables d'environnement définies
- [ ] Fichiers de configuration créés
- [ ] Projet créé dans Blueprint
- [ ] Services déployés
- [ ] Base de données configurée
- [ ] Domaines configurés
- [ ] SSL activé
- [ ] Tests de connectivité passés
- [ ] Monitoring configuré
- [ ] Backups activés

---

**Statut** : ✅ Prêt pour le déploiement Blueprint
**Dernière mise à jour** : $(date)
**Version** : 1.0.0
