const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'votre_secret_jwt_super_secret';

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de données en mémoire
let incidents = [];
let nextTicketId = 1001;
let technicians = [
  { id: 'tech1', name: 'Alice Dubois', email: 'alice.d@amd.com' },
  // ... autres techniciens
];
let inventory = [
  { id: 'inv001', name: 'Dell XPS 15', type: 'Ordinateur Portable', status: 'Disponible' },
  // ... autres équipements
];

// Authentification
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = technicians.find(t => t.email === email);
  
  if (!user) return res.status(401).json({ message: 'Identifiants invalides' });
  
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: 'technicien' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Accès non autorisé');
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Token invalide');
    req.user = user;
    next();
  });
};

// Routes pour les incidents
app.post('/api/incidents', (req, res) => {
  // Validation et création d'incident (identique au code existant)
  // ...
  incidents.push(newIncident);
  res.status(201).json({ ticketId: newIncident.ticketId });
});

app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.patch('/api/incidents/:ticketId/assign', authenticate, (req, res) => {
  // Assignation d'un technicien (identique au code existant)
  // ...
});

// Routes pour l'inventaire
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', authenticate, (req, res) => {
  // Ajout d'équipement (identique au code existant)
  // ...
  inventory.push(newItem);
  res.status(201).json(newItem);
});

// Route pour le suivi des tickets (compatible frontend suivi)
app.get('/api/tickets', (req, res) => {
  const ticketsPourSuivi = incidents.map(i => ({
    id: i.ticketId,
    nomPrenom: `${i.prenom} ${i.nom}`,
    departement: i.departement,
    typeMatériel: i.typeMateriel,
    description: i.descriptionSouci,
    priorité: i.priorite,
    état: i.status,
    technicienAssigné: i.assignedTo,
    dateCreation: i.timestamp
  }));
  res.json(ticketsPourSuivi);
});

app.listen(PORT, () => {
  console.log(`Serveur unifié démarré sur http://localhost:${PORT}`);
});