# 📦 Fonctionnalité de Demande de Matériel

## Description

La fonctionnalité "Demande de Matériel" permet aux utilisateurs de formuler des demandes d'acquisition de matériel informatique. Cette fonctionnalité est accessible depuis la page d'accueil et crée automatiquement un ticket dans le système de suivi.

## Profil utilisateur

### Chargé d'acquisition
- ✅ Accès complet à la fonctionnalité
- ✅ Peut soumettre des demandes de matériel
- ✅ Peut consulter le suivi des demandes
- ✅ Reçoit des notifications sur l'état des demandes

## Formulaire de demande

### Champs obligatoires (*)

#### Informations personnelles
- **Nom** - Nom de famille du demandeur
- **Prénoms** - Prénoms du demandeur
- **Département** - Liste déroulante avec tous les départements AMD
- **Poste** - Fonction/poste du demandeur

#### Matériel demandé
- **Matériel demandé** - Champ de saisie libre pour spécifier le matériel
- **Quantité** - Nombre d'unités demandées (minimum 1)

#### Contact et date
- **N° Téléphone** - Numéro de contact (WhatsApp recommandé)
- **Date** - Date de la demande (pré-remplie avec la date actuelle)

### Champs optionnels

#### Détails de la demande
- **Commentaire** - Zone de texte pour préciser les détails, spécifications, urgence, etc.

## Saisie du matériel

### Champ de saisie libre
- **Flexibilité totale** : L'utilisateur peut saisir n'importe quel type de matériel
- **Exemples** : "Ordinateur portable HP", "Imprimante laser Brother", "Écran 24 pouces Dell"
- **Précision** : Possibilité de spécifier la marque, le modèle, les caractéristiques
- **Placeholder** : Suggestions d'exemples pour guider l'utilisateur

## Règles importantes

### Règle "Un matériel par demande"
- ✅ **Une seule demande** par formulaire
- ✅ **Un seul type** de matériel par demande
- ❌ **Interdiction** de demander plusieurs types de matériel dans une même demande
- 📝 **Solution** : Créer des demandes séparées pour chaque type de matériel

### Validation des données
- ✅ Vérification de tous les champs obligatoires
- ✅ Validation du format du numéro de téléphone
- ✅ Contrôle de la quantité (minimum 1)
- ✅ Validation de la date

## Intégration avec le système

### Création automatique de ticket
Lors de la soumission d'une demande de matériel :

1. **Création d'un ticket** dans le système de suivi
2. **Catégorie** : "Demande de matériel"
3. **Priorité** : "Moyenne" par défaut
4. **État** : "Nouveau"
5. **Description** : Détails complets de la demande incluant :
   - Type de matériel
   - Quantité
   - Commentaire
   - Numéro de téléphone
   - Date de demande

### Suivi des demandes
- ✅ **Redirection automatique** vers la page de suivi après soumission
- ✅ **Affichage** dans la liste des tickets
- ✅ **Filtrage** possible par catégorie "Demande de matériel"
- ✅ **Modification** possible par les techniciens/administrateurs

## Interface utilisateur

### Design cohérent
- **Thème orange** pour différencier des incidents
- **Icône shopping cart** pour identifier la fonctionnalité
- **Layout responsive** adapté mobile/desktop
- **Validation en temps réel** des champs

### Navigation
- **Header** avec logo AMD et navigation
- **Breadcrumb** pour retour à l'accueil
- **Boutons d'action** : Annuler et Envoyer
- **Indicateurs visuels** pour les champs obligatoires

## Workflow utilisateur

### 1. Accès à la fonctionnalité
- Navigation depuis la page d'accueil
- Clic sur "Demande de Matériel" dans le menu
- Ou clic sur le bouton "📦 Demande de matériel"

### 2. Remplissage du formulaire
- Saisie des informations personnelles
- Sélection du matériel demandé
- Précision de la quantité
- Ajout de commentaires (optionnel)
- Saisie du numéro de téléphone
- Validation de la date

### 3. Soumission
- Validation automatique des données
- Création du ticket en arrière-plan
- Confirmation de succès
- Redirection vers le suivi

### 4. Suivi
- Consultation de l'état de la demande
- Notifications sur les mises à jour
- Possibilité de modification par les techniciens

## Avantages

### Pour les utilisateurs
- **Processus simplifié** pour les demandes de matériel
- **Formulaire dédié** avec champs spécifiques
- **Flexibilité totale** pour spécifier le matériel souhaité
- **Validation en temps réel** pour éviter les erreurs
- **Suivi intégré** dans le système existant

### Pour l'administration
- **Centralisation** des demandes de matériel
- **Traçabilité** complète des demandes
- **Gestion unifiée** avec les incidents
- **Reporting** possible sur les acquisitions

## Compatibilité

- ✅ **Navigateurs modernes** : Chrome, Firefox, Safari, Edge
- ✅ **Responsive design** : Mobile, tablette, desktop
- ✅ **Accessibilité** : Labels, contrastes, navigation clavier
- ✅ **Performance** : Chargement rapide, validation optimisée

## Sécurité

- ✅ **Validation côté client** et serveur
- ✅ **Protection contre les injections** SQL/HTML
- ✅ **Sanitisation** des données saisies
- ✅ **Gestion des erreurs** robuste 