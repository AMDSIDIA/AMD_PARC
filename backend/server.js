const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'amd_support_secret_2024!'; // À changer en production

// Middleware
app.use(cors({ 
  origin: [
    'http://localhost:3000',
    'https://amd-parc.onrender.com',
    'https://amd-parc-frontend.onrender.com'
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de données en mémoire
let incidents = [];
let nextTicketId = 1001;

let technicians = [
  { id: 'tech1', name: 'Pascal OUOBA', email: 'pascal.ouoba@amd.com' },
  { id: 'tech2', name: 'Mohamed DENE', email: 'mohamed.dene@amd.com' },
  { id: 'tech3', name: 'Dalila GOUBA', email: 'dalila.gouba@amd.com' },
];

let admins = [
  { id: 'admin1', name: 'Pascal OUOBA', email: 'pascalouoba5@gmail.com', password: 'admin1234', role: 'administrateur' }
];

let inventory = [
  { id: 'inv001', name: 'Dell XPS 15', type: 'Ordinateur Portable', status: 'Disponible', condition: 'Nouveau', assignedTo: null },
  { id: 'inv002', name: 'HP EliteBook', type: 'Ordinateur Portable', status: 'Disponible', condition: 'Ancien', assignedTo: null },
];

// ===== AUTHENTIFICATION =====
app.post('/api/auth/login', (req, res) => {
  const { email, password, motDePasse } = req.body;
  const pwd = password || motDePasse;
  // Vérifier admin
  const admin = admins.find(a => a.email === email && a.password === pwd);
  if (admin) {
    const utilisateur = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
    const token = jwt.sign(utilisateur, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, utilisateur });
  }
  // Sinon, technicien (pas de mot de passe pour la démo)
  const user = technicians.find(t => t.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
  }
  const utilisateur = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: 'technicien'
  };
  const token = jwt.sign(utilisateur, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, utilisateur });
});

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token d\'authentification manquant' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token d\'authentification invalide' });
    }
    req.user = user;
    next();
  });
};

// ===== ROUTES INCIDENTS =====
app.post('/api/incidents', (req, res) => {
  const { nom, prenom, departement, poste, descriptionSouci } = req.body;
  const errors = {};
  
  // Validation basique
  if (!nom) errors.nom = 'Le nom est obligatoire';
  if (!prenom) errors.prenom = 'Le prénom est obligatoire';
  if (!departement) errors.departement = 'Le département est obligatoire';
  if (!poste) errors.poste = 'Le poste est obligatoire';
  if (!descriptionSouci) errors.descriptionSouci = 'La description est obligatoire';
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  const newIncident = {
    ticketId: `AMD-${nextTicketId++}`,
    timestamp: new Date().toISOString(),
    status: 'Nouveau',
    assignedTo: null,
    ...req.body
  };
  
  incidents.push(newIncident);
  res.status(201).json({ 
    message: 'Incident créé avec succès', 
    ticketId: newIncident.ticketId 
  });
});

app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.patch('/api/incidents/:ticketId/assign', authenticate, (req, res) => {
  const { ticketId } = req.params;
  const { technicianId } = req.body;
  
  const incident = incidents.find(i => i.ticketId === ticketId);
  if (!incident) return res.status(404).json({ message: 'Incident non trouvé' });
  
  const technician = technicians.find(t => t.id === technicianId);
  if (!technician) return res.status(404).json({ message: 'Technicien non trouvé' });
  
  incident.assignedTo = technician.name;
  incident.status = 'Assigné';
  
  res.json({ 
    message: `Incident assigné à ${technician.name}`,
    incident 
  });
});

app.patch('/api/incidents/:ticketId/status', authenticate, (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  
  const incident = incidents.find(i => i.ticketId === ticketId);
  if (!incident) return res.status(404).json({ message: 'Incident non trouvé' });
  
  incident.status = status;
  res.json({ 
    message: `Statut mis à jour: ${status}`,
    incident 
  });
});

// ===== ROUTES INVENTAIRE =====
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', authenticate, (req, res) => {
  const { name, type, condition } = req.body;
  
  if (!name || !type || !condition) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }
  
  const newItem = {
    id: `INV-${Date.now()}`,
    name,
    type,
    condition,
    status: 'Disponible',
    assignedTo: null,
    addedDate: new Date().toISOString()
  };
  
  inventory.push(newItem);
  res.status(201).json(newItem);
});

// ===== ROUTES TECHNICIENS =====
app.get('/api/technicians', (req, res) => {
  res.json(technicians);
});

// Route spéciale pour la page de suivi
app.get('/api/tickets', (req, res) => {
  const tickets = incidents.map(i => ({
    id: i.ticketId,
    nomPrenom: `${i.prenom} ${i.nom}`,
    departement: i.departement,
    poste: i.poste,
    typeMatériel: i.typeMateriel,
    description: i.descriptionSouci,
    priorité: i.priorite,
    état: i.status,
    technicienAssigné: i.assignedTo,
    dateCreation: i.timestamp,
    catégorie: i.catégorie || 'Matériel'
  }));
  
  res.json(tickets);
});

// Route pour créer des tickets (utilisée par le formulaire de demande de matériel)
app.post('/api/tickets', (req, res) => {
  const { nomPrenom, departement, poste, typeMatériel, description, priorité, état, catégorie } = req.body;
  const errors = {};
  
  // Validation basique
  if (!nomPrenom) errors.nomPrenom = 'Le nom et prénom sont obligatoires';
  if (!departement) errors.departement = 'Le département est obligatoire';
  if (!poste) errors.poste = 'Le poste est obligatoire';
  if (!typeMatériel) errors.typeMatériel = 'Le type de matériel est obligatoire';
  if (!description) errors.description = 'La description est obligatoire';
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  // Séparer nom et prénom
  const [prenom, ...nomParts] = nomPrenom.split(' ');
  const nom = nomParts.join(' ');
  
  const newTicket = {
    ticketId: `TK-${new Date().getFullYear()}-${String(nextTicketId++).padStart(3, '0')}`,
    timestamp: new Date().toISOString(),
    status: état || 'Nouveau',
    assignedTo: null,
    nom,
    prenom,
    departement,
    poste,
    typeMateriel: typeMatériel,
    descriptionSouci: description,
    priorite: priorité || 'Moyenne',
    catégorie: catégorie || 'Matériel'
  };
  
  incidents.push(newTicket);
  
  res.status(201).json({ 
    message: 'Ticket créé avec succès', 
    ticketId: newTicket.ticketId,
    ticket: {
      id: newTicket.ticketId,
      nomPrenom: `${newTicket.prenom} ${newTicket.nom}`,
      departement: newTicket.departement,
      poste: newTicket.poste,
      typeMatériel: newTicket.typeMateriel,
      description: newTicket.descriptionSouci,
      priorité: newTicket.priorite,
      état: newTicket.status,
      technicienAssigné: newTicket.assignedTo,
      dateCreation: newTicket.timestamp,
      catégorie: newTicket.catégorie
    }
  });
});



// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log(`- POST   /api/incidents`);
  console.log(`- GET    /api/incidents`);
  console.log(`- PATCH  /api/incidents/:ticketId/assign`);
  console.log(`- GET    /api/tickets (pour le suivi)`);
  console.log(`- POST   /api/tickets (création de tickets)`);
  console.log(`- POST   /api/auth/login`);
}); 