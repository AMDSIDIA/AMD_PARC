const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import des modèles
const User = require('./models/User');
const Incident = require('./models/Incident');
const Inventory = require('./models/Inventory');

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'amd_support_secret_2024!';

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

// ===== AUTHENTIFICATION =====
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, motDePasse } = req.body;
    const pwd = password || motDePasse;
    
    // Rechercher l'utilisateur par email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe pour les administrateurs
    if (user.role === 'administrateur' && user.password !== pwd) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const utilisateur = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    const token = jwt.sign(utilisateur, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, utilisateur });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
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
app.post('/api/incidents', async (req, res) => {
  try {
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
    
    // Générer le prochain ID de ticket
    const ticketId = await Incident.getNextTicketId();
    
    // Créer l'incident
    const incident = await Incident.create({
      ticket_id: ticketId,
      nom,
      prenom,
      departement,
      poste,
      description_souci: descriptionSouci,
      categorie: 'Incident technique',
      priorite: 'Moyenne'
    });
    
    res.status(201).json({
      message: 'Incident créé avec succès',
      ticket: {
        id: incident.ticket_id,
        nom: incident.nom,
        prenom: incident.prenom,
        departement: incident.departement,
        poste: incident.poste,
        description: incident.description_souci,
        etat: incident.etat,
        priorite: incident.priorite,
        created_at: incident.created_at
      }
    });
  } catch (error) {
    console.error('Erreur création incident:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'incident' });
  }
});

app.get('/api/incidents', authenticate, async (req, res) => {
  try {
    const incidents = await Incident.getAll();
    res.json(incidents);
  } catch (error) {
    console.error('Erreur récupération incidents:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des incidents' });
  }
});

app.patch('/api/incidents/:ticketId/assign', authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { technicianId } = req.body;
    
    const updatedIncident = await Incident.assignToTechnician(ticketId, technicianId);
    
    if (!updatedIncident) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }
    
    res.json(updatedIncident);
  } catch (error) {
    console.error('Erreur attribution incident:', error);
    res.status(500).json({ message: 'Erreur lors de l\'attribution de l\'incident' });
  }
});

app.patch('/api/incidents/:ticketId/status', authenticate, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    const updatedIncident = await Incident.updateStatus(ticketId, status);
    
    if (!updatedIncident) {
      return res.status(404).json({ message: 'Incident non trouvé' });
    }
    
    res.json(updatedIncident);
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
});

// ===== ROUTES TICKETS =====
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Incident.getTicketsForTracking();
    res.json(tickets);
  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
});

// ===== ROUTES TECHNICIENS =====
app.get('/api/technicians', async (req, res) => {
  try {
    const technicians = await User.getAllTechnicians();
    res.json(technicians);
  } catch (error) {
    console.error('Erreur récupération techniciens:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des techniciens' });
  }
});

// ===== ROUTES INVENTAIRE =====
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.getAll();
    res.json(inventory);
  } catch (error) {
    console.error('Erreur récupération inventaire:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'inventaire' });
  }
});

app.post('/api/inventory', authenticate, async (req, res) => {
  try {
    const { name, type, status, condition } = req.body;
    
    // Générer l'ID de l'item
    const itemId = await Inventory.getNextItemId();
    
    const item = await Inventory.create({
      item_id: itemId,
      name,
      type,
      status: status || 'Disponible',
      condition: condition || 'Bon'
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Erreur création item:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'item' });
  }
});

app.patch('/api/inventory/:itemId', authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;
    
    const updatedItem = await Inventory.update(itemId, updateData);
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item non trouvé' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Erreur mise à jour item:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'item' });
  }
});

// ===== ROUTE DE SANTÉ =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur AMD Parc Informatique opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: ${process.env.NODE_ENV === 'production' ? 'https://amd-parc-backend.onrender.com' : `http://localhost:${PORT}`}`);
}); 