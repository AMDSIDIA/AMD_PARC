# Guide de Contribution - Parc Informatique AMD

## 🚀 Comment contribuer

Merci de votre intérêt pour contribuer au projet Parc Informatique AMD ! Ce document vous guidera à travers le processus de contribution.

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Git

## 🔧 Configuration initiale

1. **Fork le repository**
   ```bash
   # Cloner votre fork
   git clone https://github.com/votre-username/parc-informatique-amd.git
   cd parc-informatique-amd
   
   # Ajouter le repository original comme upstream
   git remote add upstream https://github.com/amd-international/parc-informatique-amd.git
   ```

2. **Installer les dépendances**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

## 🌿 Conventions de branches

### Structure des branches

- `main` - Branche principale, code stable
- `develop` - Branche de développement
- `feature/nom-de-la-fonctionnalite` - Nouvelles fonctionnalités
- `bugfix/nom-du-bug` - Corrections de bugs
- `hotfix/nom-du-hotfix` - Corrections urgentes
- `release/version` - Préparation des releases

### Création d'une branche

```bash
# Basculer sur develop
git checkout develop
git pull upstream develop

# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite
```

## 📝 Conventions de commit

### Format des messages de commit

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types de commit

- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `style` - Formatage, points-virgules manquants, etc.
- `refactor` - Refactoring du code
- `test` - Ajout ou modification de tests
- `chore` - Tâches de maintenance

### Exemples

```bash
feat(auth): ajouter l'authentification JWT
fix(api): corriger l'erreur 500 sur /api/incidents
docs(readme): mettre à jour la documentation d'installation
style(ui): améliorer l'interface utilisateur
refactor(backend): restructurer les routes API
test(frontend): ajouter des tests pour les composants
chore(deps): mettre à jour les dépendances
```

## 🔍 Vérifications avant commit

### Tests automatiques

Le hook pre-commit vérifie automatiquement :
- Erreurs TypeScript
- Erreurs ESLint
- Validité des fichiers package.json

### Tests manuels

Avant de soumettre une PR, assurez-vous que :
- [ ] Le code compile sans erreur
- [ ] Les tests passent
- [ ] Le code respecte les conventions ESLint
- [ ] La documentation est mise à jour si nécessaire
- [ ] Les nouvelles fonctionnalités sont testées

## 🧪 Tests

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
npm test
```

## 📦 Pull Request

### Processus de soumission

1. **Développer votre fonctionnalité**
   ```bash
   # Faire vos modifications
   git add .
   git commit -m "feat(scope): description"
   ```

2. **Pousser vers votre fork**
   ```bash
   git push origin feature/nouvelle-fonctionnalite
   ```

3. **Créer une Pull Request**
   - Aller sur GitHub
   - Cliquer sur "New Pull Request"
   - Sélectionner votre branche
   - Remplir le template de PR

### Template de Pull Request

```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests manuels effectués

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué un auto-review de mon code
- [ ] J'ai commenté mon code, particulièrement dans les parties difficiles à comprendre
- [ ] J'ai fait les changements correspondants dans la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction fonctionne
- [ ] Les tests unitaires et d'intégration passent avec mes changements
- [ ] Toute nouvelle ou existante dépendance est compatible avec les changements

## Screenshots (si applicable)
Ajouter des captures d'écran pour les changements UI.

## Informations supplémentaires
Toute information supplémentaire ou contexte.
```

## 🐛 Signaler un bug

### Template de bug report

```markdown
## Description du bug
Description claire et concise du bug.

## Étapes pour reproduire
1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## Comportement attendu
Description claire et concise de ce qui devrait se passer.

## Screenshots
Si applicable, ajouter des captures d'écran.

## Environnement
- OS: [ex: Windows 10]
- Navigateur: [ex: Chrome, Safari]
- Version: [ex: 22]

## Informations supplémentaires
Toute autre information ou contexte.
```

## 💡 Proposer une fonctionnalité

### Template de feature request

```markdown
## Problème
Description claire et concise du problème que cette fonctionnalité résoudrait.

## Solution proposée
Description claire et concise de ce que vous voulez qu'il se passe.

## Alternatives considérées
Description claire et concise de toutes les solutions alternatives que vous avez considérées.

## Informations supplémentaires
Toute autre information ou contexte.
```

## 📞 Support

Si vous avez des questions ou besoin d'aide :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet.
