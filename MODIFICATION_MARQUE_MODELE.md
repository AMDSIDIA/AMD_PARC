# 🔄 Modification du champ "Marque & modèle"

## Changements effectués

### Avant
- Champ texte libre avec placeholder "Ex: Dell Latitude 5520"
- L'utilisateur devait saisir manuellement la marque et le modèle

### Après
- Liste déroulante avec options prédéfinies
- Champ texte conditionnel pour "Autre à préciser"

## Options disponibles

### Liste déroulante principale
1. **HP** - Marque HP générique
2. **Lenovo Thinkpad** - Série Thinkpad de Lenovo
3. **HP Pavillon** - Série Pavillon de HP
4. **Dell** - Marque Dell générique
5. **Autre à préciser** - Option pour les autres marques/modèles

### Champ conditionnel
- Apparaît uniquement quand "Autre à préciser" est sélectionné
- Label : "Autre à préciser sur la marque et le modèle"
- Placeholder : "Précisez la marque et le modèle"

## Fonctionnalités

### Logique de gestion
- Si une option prédéfinie est sélectionnée → utilise cette valeur
- Si "Autre à préciser" est sélectionné → utilise la valeur du champ texte
- Le champ "autre" se réinitialise automatiquement si on change d'option

### Validation
- Le champ "autre" est requis si "Autre à préciser" est sélectionné
- Les données sont envoyées au backend avec la valeur appropriée

### Interface utilisateur
- Design cohérent avec les autres champs du formulaire
- Icône de flèche pour indiquer la liste déroulante
- Affichage conditionnel du champ texte

## Fichiers modifiés
- `app/signaler/page.tsx` - Interface utilisateur et logique
- `backend/server.js` - Réception des données (pas de modification nécessaire)

## Compatibilité
- Les anciens tickets avec des valeurs textuelles libres restent compatibles
- Le backend reçoit toujours une chaîne de caractères pour `marqueModele` 