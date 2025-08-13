
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface Ticket {
  id: string;
  nomPrenom: string;
  departement: string;
  poste: string;
  typeMatériel: string;
  description: string;
  priorité: 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';
  catégorie: string;
  état: 'Nouveau' | 'Assigné' | 'En cours' | 'En attente de pièce' | 'Résolu' | 'Clôturé';
  technicienAssigné?: string;
  dateCreation: Date;
  dateAssignation?: Date;
  dateResolution?: Date;
  dateCloture?: Date;
  slaStatut: 'OK' | 'Attention' | 'Dépassé';
  tempsRestant: string;
}

interface Utilisateur {
  nom: string;
  email: string;
  role: 'technicien' | 'administrateur';
  motDePasse: string;
}

const SuiviPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtreEtat, setFiltreEtat] = useState<string>('Tous');
  const [filtrePriorité, setFiltrePriorité] = useState<string>('Tous');
  const [filtreCategorie, setFiltreCategorie] = useState<string>('Tous');
  const [recherche, setRecherche] = useState('');
  const [ticketSelectionne, setTicketSelectionne] = useState<Ticket | null>(null);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [modalModification, setModalModification] = useState(false);
  const [ticketModification, setTicketModification] = useState<Ticket | null>(null);

  // États pour l'authentification
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<Utilisateur | null>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [modalGestionComptes, setModalGestionComptes] = useState(false);
  const [emailConnexion, setEmailConnexion] = useState('');
  const [motDePasseConnexion, setMotDePasseConnexion] = useState('');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
    nom: '',
    email: '',
    role: 'technicien' as 'technicien' | 'administrateur',
    motDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // États pour la gestion des techniciens
  const [techniciens, setTechniciens] = useState<{ id: string; name: string }[]>([]);

  // Charger les utilisateurs depuis le localStorage
  useEffect(() => {
    const utilisateursSauvegardes = localStorage.getItem('utilisateurs_amd');
    if (utilisateursSauvegardes) {
      setUtilisateurs(JSON.parse(utilisateursSauvegardes));
    } else {
      // Créer un administrateur par défaut
      const adminParDefaut: Utilisateur = {
        nom: 'Administrateur',
        email: 'admin@amd-international.com',
        role: 'administrateur',
        motDePasse: 'admin123'
      };
      setUtilisateurs([adminParDefaut]);
      localStorage.setItem('utilisateurs_amd', JSON.stringify([adminParDefaut]));
    }
  }, []);

  // Charger l'utilisateur connecté depuis le localStorage
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('utilisateur_connecte_amd');
    if (utilisateurSauvegarde) {
      setUtilisateurConnecte(JSON.parse(utilisateurSauvegarde));
    }
  }, []);

  // Charger la liste des techniciens depuis l'API
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/technicians');
        if (!response.ok) throw new Error('Erreur de chargement des techniciens');
        const data = await response.json();
        setTechniciens(data);
      } catch (e) {
        setTechniciens([]);
      }
    };
    fetchTechnicians();
  }, []);

  // Fonction de connexion
  const seConnecter = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailConnexion, motDePasse: motDePasseConnexion })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Email ou mot de passe incorrect');
        return;
      }
      const data = await response.json();
      // data doit contenir { token, utilisateur }
      if (data.token && data.utilisateur) {
        setUtilisateurConnecte(data.utilisateur);
        localStorage.setItem('utilisateur_connecte_amd', JSON.stringify(data.utilisateur));
        localStorage.setItem('authToken', data.token);
        setModalConnexion(false);
        setEmailConnexion('');
        setMotDePasseConnexion('');
      } else {
        alert('Réponse inattendue du serveur.');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur.');
    }
  };

  // Fonction de déconnexion
  const seDeconnecter = () => {
    setUtilisateurConnecte(null);
    localStorage.removeItem('utilisateur_connecte_amd');
  };

  // Fonction pour ajouter un utilisateur (admin seulement)
  const ajouterUtilisateur = () => {
    if (nouvelUtilisateur.nom && nouvelUtilisateur.email && nouvelUtilisateur.motDePasse) {
      const emailExiste = utilisateurs.some(u => u.email === nouvelUtilisateur.email);
      if (emailExiste) {
        alert('Un utilisateur avec cet email existe déjà');
        return;
      }

      const nouveauxUtilisateurs = [...utilisateurs, nouvelUtilisateur];
      setUtilisateurs(nouveauxUtilisateurs);
      localStorage.setItem('utilisateurs_amd', JSON.stringify(nouveauxUtilisateurs));

      setNouvelUtilisateur({
        nom: '',
        email: '',
        role: 'technicien',
        motDePasse: ''
      });

      alert('Utilisateur ajouté avec succès');
    }
  };

  // Fonction pour supprimer un utilisateur (admin seulement)
  const supprimerUtilisateur = (email: string) => {
    if (email === 'admin@amd-international.com') {
      alert('Impossible de supprimer le compte administrateur principal');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      const nouveauxUtilisateurs = utilisateurs.filter(u => u.email !== email);
      setUtilisateurs(nouveauxUtilisateurs);
      localStorage.setItem('utilisateurs_amd', JSON.stringify(nouveauxUtilisateurs));
    }
  };

  // Vérifier si l'utilisateur a les droits de modification (administrateurs et techniciens seulement)
  const peutModifier = () => {
    return utilisateurConnecte && (utilisateurConnecte.role === 'technicien' || utilisateurConnecte.role === 'administrateur');
  };

  // Vérifier si l'utilisateur est administrateur
  const estAdministrateur = () => {
    return utilisateurConnecte && utilisateurConnecte.role === 'administrateur';
  };

  // Vérifier si l'utilisateur est technicien
  const estTechnicien = () => {
    return utilisateurConnecte && utilisateurConnecte.role === 'technicien';
  };

  // Charger les tickets depuis l'API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const API_BASE_URL = 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/tickets`);
        
        if (!response.ok) {
          throw new Error('Erreur de chargement des tickets');
        }
        
        const data = await response.json();
        
        // Convertir les données de l'API au format attendu et filtrer uniquement les incidents
        const convertedTickets: Ticket[] = data
          .filter((ticket: any) => ticket.catégorie !== 'Demande de matériel')
          .map((ticket: any) => ({
            id: ticket.id,
            nomPrenom: ticket.nomPrenom,
            departement: ticket.departement,
            poste: ticket.poste || 'Non spécifié',
            typeMatériel: ticket.typeMatériel,
            description: ticket.description,
            priorité: ticket.priorité,
            catégorie: ticket.catégorie || 'Matériel', // Utiliser la catégorie du ticket ou 'Matériel' par défaut
            état: ticket.état,
            technicienAssigné: ticket.technicienAssigné,
            dateCreation: new Date(ticket.dateCreation),
            slaStatut: 'OK' as const, // Valeur par défaut
            tempsRestant: '24h' // Valeur par défaut
          }));
        
        setTickets(convertedTickets);
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
        // En cas d'erreur, utiliser des données simulées pour les incidents
        const mockTickets: Ticket[] = [
          {
            id: 'TK-2024-001',
            nomPrenom: 'Marie Dubois',
            departement: 'Pôle Finance Publique',
            poste: 'Analyste Financier',
            typeMatériel: 'Portable',
            description: 'Écran bleu au démarrage',
            priorité: 'Haute',
            catégorie: 'Matériel',
            état: 'En cours',
            technicienAssigné: 'Jean Martin',
            dateCreation: new Date(2024, 0, 15, 9, 30),
            dateAssignation: new Date(2024, 0, 15, 11, 15),
            slaStatut: 'OK',
            tempsRestant: '18h 30min'
          },
          {
            id: 'TK-2024-002',
            nomPrenom: 'Pierre Durand',
            departement: 'Département Commercial',
            poste: 'Commercial',
            typeMatériel: 'Ordinateur de Bureau',
            description: 'Impossible de se connecter au réseau',
            priorité: 'Urgente',
            catégorie: 'Réseau',
            état: 'Nouveau',
            dateCreation: new Date(2024, 0, 16, 14, 20),
            slaStatut: 'OK',
            tempsRestant: '24h'
          }
        ];
        setTickets(mockTickets);
      }
    };
    
    fetchTickets();
  }, []);

  // Fonction pour envoyer les notifications par email
  const envoyerNotification = async (type: string, ticket: Ticket) => {
    const emailData = {
      to: 'pascalouoba5@gmail.com',
      subject: '',
      body: ''
    };

    switch (type) {
      case 'creation':
        emailData.subject = `[AMD Support] Nouveau ticket créé - ${ticket.id}`;
        emailData.body = `Un nouveau ticket a été créé par ${ticket.nomPrenom}. Priorité: ${ticket.priorité}. Description: ${ticket.description}`;
        break;
      case 'assignation':
        emailData.subject = `[AMD Support] Ticket assigné - ${ticket.id}`;
        emailData.body = `Le ticket ${ticket.id} vous a été assigné. Utilisateur: ${ticket.nomPrenom}. Priorité: ${ticket.priorité}`;
        break;
      case 'resolution':
        emailData.subject = `[AMD Support] Ticket résolu - ${ticket.id}`;
        emailData.body = `Votre ticket ${ticket.id} a été résolu. Merci de valider la résolution dans les 24h.`;
        break;
      case 'cloture':
        emailData.subject = `[AMD Support] Ticket clôturé - ${ticket.id}`;
        emailData.body = `Le ticket ${ticket.id} a été clôturé. Résolution validée.`;
        break;
    }

    console.log('Notification envoyée:', emailData);
  };

  const changerEtat = (ticketId: string, nouvelEtat: Ticket['état']) => {
    if (!peutModifier()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent modifier les incidents');
      return;
    }

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = { ...ticket, état: nouvelEtat };

        // Envoi des notifications selon l'état
        if (nouvelEtat === 'Assigné' && !ticket.dateAssignation) {
          updatedTicket.dateAssignation = new Date();
          envoyerNotification('assignation', updatedTicket);
        } else if (nouvelEtat === 'Résolu' && !ticket.dateResolution) {
          updatedTicket.dateResolution = new Date();
          envoyerNotification('resolution', updatedTicket);
        } else if (nouvelEtat === 'Clôturé' && !ticket.dateCloture) {
          updatedTicket.dateCloture = new Date();
          envoyerNotification('cloture', updatedTicket);
        }

        return updatedTicket;
      }
      return ticket;
    }));
  };

  const assignerTechnicien = (ticketId: string, technicien: string) => {
    if (!estAdministrateur()) {
      alert('Accès refusé: Seuls les administrateurs peuvent assigner des techniciens aux incidents');
      return;
    }

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          technicienAssigné: technicien,
          état: 'Assigné',
          dateAssignation: new Date()
        };
      }
      return ticket;
    }));
  };

  const ticketsFiltres = tickets.filter(ticket => {
    const matchEtat = filtreEtat === 'Tous' || ticket.état === filtreEtat;
    const matchPriorité = filtrePriorité === 'Tous' || ticket.priorité === filtrePriorité;
    const matchCategorie = filtreCategorie === 'Tous' || ticket.catégorie === filtreCategorie;
    const matchRecherche = ticket.nomPrenom.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(recherche.toLowerCase());

    return matchEtat && matchPriorité && matchCategorie && matchRecherche;
  });

  const getPriorityColor = (priorité: string) => {
    switch (priorité) {
      case 'Urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'Haute': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Basse': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (état: string) => {
    switch (état) {
      case 'Nouveau': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Assigné': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'En cours': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'En attente de pièce': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Résolu': return 'bg-green-100 text-green-800 border-green-200';
      case 'Clôturé': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSlaColor = (slaStatut: string) => {
    switch (slaStatut) {
      case 'OK': return 'text-green-600';
      case 'Attention': return 'text-orange-600';
      case 'Dépassé': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const états = ['Nouveau', 'Assigné', 'En cours', 'En attente de pièce', 'Résolu', 'Clôturé'];
  const priorités = ['Basse', 'Moyenne', 'Haute', 'Urgente'];
  const catégories = ['Matériel', 'Demande de matériel'];
  // const techniciens = ['Jean Martin', 'Sophie Chen', 'Marc Thierry', 'Paul Durand', 'Lisa Bernard']; // SUPPRIMER cette ligne

  const ouvrirDetails = (ticket: Ticket) => {
    setTicketSelectionne(ticket);
    setModalOuverte(true);
  };

  const fermerModal = () => {
    setModalOuverte(false);
    setTicketSelectionne(null);
  };

  const ouvrirModification = (ticket: Ticket) => {
    setTicketModification({ ...ticket });
    setModalModification(true);
  };

  const fermerModalModification = () => {
    setModalModification(false);
    setTicketModification(null);
  };

  const sauvegarderModification = () => {
    if (ticketModification) {
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketModification.id ? ticketModification : ticket
      ));
      fermerModalModification();
      alert('Ticket modifié avec succès !');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="cursor-pointer">
              <img
                src="https://static.readdy.ai/image/1b1470ae2e6c51ef9abc425519678c59/ef4fe7e82dbc5a71c70987c5727051b9.png"
                alt="AMD International Logo"
                className="h-12 w-auto"
              />
            </Link>
            <span className="ml-4 text-lg font-semibold text-gray-800">
              AMD International - Parc Informatique
            </span>

            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Accueil</Link>
              <Link href="/signaler" className="text-gray-600 hover:text-gray-900">Signaler</Link>
              <Link href="/suivi" className="text-red-600 font-medium">Suivi des Incidents</Link>
              <Link href="/suivi-demandes" className="text-gray-600 hover:text-gray-900">Suivi des Demandes</Link>
              <Link href="/gestion-comptes" className="text-gray-600 hover:text-gray-900">Gestion des comptes</Link>

              {/* Authentification */}
              {utilisateurConnecte ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Connecté: <span className="font-medium">{utilisateurConnecte.nom}</span>
                    <span className="text-xs text-gray-500 ml-1">({utilisateurConnecte.role})</span>
                  </span>
                  {estAdministrateur() && (
                    <button
                      onClick={() => setModalGestionComptes(true)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-user-settings-line mr-1"></i>
                      Gérer les comptes
                    </button>
                  )}
                  <button
                    onClick={seDeconnecter}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-logout-box-line mr-1"></i>
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setModalConnexion(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-login-box-line mr-2"></i>
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Alerte de restriction */}
      {!utilisateurConnecte && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-alert-line text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Accès restreint:</strong> Vous pouvez consulter les incidents mais seuls les administrateurs et techniciens peuvent effectuer des modifications.
                  <button
                    onClick={() => setModalConnexion(true)}
                    className="ml-2 text-yellow-800 underline hover:text-yellow-900 cursor-pointer"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerte pour utilisateurs connectés sans droits de modification */}
      {utilisateurConnecte && !peutModifier() && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-information-line text-orange-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Accès en lecture seule:</strong> Vous êtes connecté en tant que <strong>{utilisateurConnecte.role}</strong>. 
                  Seuls les administrateurs et techniciens peuvent modifier les incidents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suivi des Incidents</h1>
              <p className="text-gray-600 mt-2">Gérez et suivez l'état de tous les incidents signalés</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-medium">{ticketsFiltres.length} incidents</span>
              </div>
              
              {utilisateurConnecte && (
                <div className={`px-4 py-2 rounded-lg ${
                  peutModifier() 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-orange-50 border border-orange-200'
                }`}>
                  <span className={`text-sm font-medium ${
                    peutModifier() ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    <i className={`mr-1 ${peutModifier() ? 'ri-check-line' : 'ri-eye-line'}`}></i>
                    {peutModifier() ? 'Modification autorisée' : 'Lecture seule'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques SLA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">SLA Respectés</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Temps Moyen</p>
                <p className="text-2xl font-bold text-orange-600">24h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-alert-line text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">En Retard</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-team-line text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Techniciens Actifs</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagramme comparatif incidents soumis vs résolus */}
        <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Comparatif Incidents Soumis / Résolus</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                {
                  name: 'Incidents',
                  "Total soumis": tickets.length,
                  "Résolus": tickets.filter(t => t.état === 'Résolu' || t.état === 'Clôturé').length
                }
              ]}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total soumis" fill="#2563eb" />
              <Bar dataKey="Résolus" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="Rechercher..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
              <select
                value={filtreEtat}
                onChange={(e) => setFiltreEtat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                <option value="Tous">Tous les états</option>
                {états.map(état => (
                  <option key={état} value={état}>{état}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
              <select
                value={filtrePriorité}
                onChange={(e) => setFiltrePriorité(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                <option value="Tous">Toutes priorités</option>
                {priorités.map(priorité => (
                  <option key={priorité} value={priorité}>{priorité}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={filtreCategorie}
                onChange={(e) => setFiltreCategorie(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                <option value="Tous">Toutes catégories</option>
                {catégories.map(catégorie => (
                  <option key={catégorie} value={catégorie}>{catégorie}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap">
                <i className="ri-refresh-line mr-2"></i>
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des incidents */}
        <div className="space-y-4">
          {ticketsFiltres.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.id}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Utilisateur:</span>
                        <span className="ml-2 font-medium">{ticket.nomPrenom}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Département:</span>
                        <span className="ml-2">{ticket.departement}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Poste:</span>
                        <span className="ml-2">{ticket.poste}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Matériel:</span>
                        <span className="ml-2">{ticket.typeMatériel}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3">{ticket.description}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priorité)}`}>
                      {ticket.priorité}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.état)}`}>
                      {ticket.état}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      ticket.catégorie === 'Demande de matériel' 
                        ? 'bg-orange-100 text-orange-800 border-orange-200' 
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {ticket.catégorie}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <i className="ri-time-line mr-1"></i>
                      {ticket.dateCreation.toLocaleDateString('fr-FR')} {ticket.dateCreation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {ticket.technicienAssigné && (
                      <div>
                        <i className="ri-user-line mr-1"></i>
                        {ticket.technicienAssigné}
                      </div>
                    )}
                    <div className={`font-medium ${getSlaColor(ticket.slaStatut)}`}>
                      <i className="ri-calendar-line mr-1"></i>
                      {ticket.tempsRestant}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {ticket.état === 'Nouveau' && estAdministrateur() && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignerTechnicien(ticket.id, e.target.value);
                          }
                        }}
                        className="px-3 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                        title="Assigner un technicien"
                      >
                        <option value="">Assigner à...</option>
                        {techniciens.map(tech => (
                          <option key={tech.id} value={tech.name}>{tech.name}</option>
                        ))}
                      </select>
                    )}

                    {ticket.état === 'Nouveau' && !estAdministrateur() && peutModifier() && (
                      <span 
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap cursor-help"
                        title="Seuls les administrateurs peuvent assigner des techniciens"
                      >
                        En attente d'assignation
                      </span>
                    )}

                    {peutModifier() ? (
                      <select
                        value={ticket.état}
                        onChange={(e) => changerEtat(ticket.id, e.target.value as Ticket['état'])}
                        className="px-3 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                        title="Modifier le statut"
                      >
                        {états.map(état => (
                          <option key={état} value={état}>{état}</option>
                        ))}
                      </select>
                    ) : (
                      <span 
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap cursor-help"
                        title="Seuls les administrateurs et techniciens peuvent modifier le statut"
                      >
                        {ticket.état}
                      </span>
                    )}

                    <button
                      onClick={() => ouvrirDetails(ticket)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-eye-line mr-1"></i>
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {ticketsFiltres.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <i className="ri-search-line text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun incident trouvé</h3>
              <p className="text-gray-600">Aucun incident ne correspond aux critères de recherche.</p>
            </div>
          )}
        </div>

        {/* Modal de connexion */}
        {modalConnexion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Connexion Technicien/Admin</h2>
                  <button
                    onClick={() => setModalConnexion(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={emailConnexion}
                    onChange={(e) => setEmailConnexion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="votre.email@amd-international.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={motDePasseConnexion}
                      onChange={(e) => setMotDePasseConnexion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                      placeholder="Mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <i className="ri-eye-off-line"></i>
                      ) : (
                        <i className="ri-eye-line"></i>
                      )}
                    </button>
                  </div>
                </div>

                {/* Supprimer le bloc Compte de test disponible */}
                {/* <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Compte de test disponible:</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> admin@amd-international.com<br />
                    <strong>Mot de passe:</strong> admin123
                  </p>
                </div> */}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setModalConnexion(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={seConnecter}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-login-box-line mr-2"></i>
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de gestion des comptes */}
        {modalGestionComptes && estAdministrateur() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des Comptes</h2>
                  <button
                    onClick={() => setModalGestionComptes(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Ajouter un utilisateur */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un utilisateur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                      <input
                        type="text"
                        value={nouvelUtilisateur.nom}
                        onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, nom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={nouvelUtilisateur.email}
                        onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="jean.dupont@amd-international.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                      <select
                        value={nouvelUtilisateur.role}
                        onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, role: e.target.value as 'technicien' | 'administrateur' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                      >
                        <option value="technicien">Technicien</option>
                        <option value="administrateur">Administrateur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                      <input
                        type="password"
                        value={nouvelUtilisateur.motDePasse}
                        onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, motDePasse: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Mot de passe"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={ajouterUtilisateur}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-user-add-line mr-2"></i>
                      Ajouter l'utilisateur
                    </button>
                  </div>
                </div>

                {/* Liste des utilisateurs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs existants</h3>
                  <div className="space-y-3">
                    {utilisateurs.map((utilisateur, index) => (
                      <div key={utilisateur.email} className="flex items-center justify-between bg-white rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{utilisateur.nom}</h4>
                            <p className="text-sm text-gray-600">{utilisateur.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${utilisateur.role === 'administrateur' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{utilisateur.role}</span>
                        </div>
                        {utilisateur.email !== 'admin@amd-international.com' && (
                          <button
                            onClick={() => supprimerUtilisateur(utilisateur.email)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setModalGestionComptes(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal des détails */}
        {modalOuverte && ticketSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de l'Incident</h2>
                  <button
                    onClick={fermerModal}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* En-tête de l'incident */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticketSelectionne.id}</h3>
                      <p className="text-gray-600">{ticketSelectionne.description}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticketSelectionne.priorité)}`}>
                        {ticketSelectionne.priorité}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticketSelectionne.état)}`}>
                        {ticketSelectionne.état}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations utilisateur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="ri-user-line mr-2 text-blue-600"></i>
                      Informations Utilisateur
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{ticketSelectionne.nomPrenom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Département:</span>
                        <span className="font-medium">{ticketSelectionne.departement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Poste:</span>
                        <span className="font-medium">{ticketSelectionne.poste}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Catégorie:</span>
                        <span className="font-medium">{ticketSelectionne.catégorie}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="ri-computer-line mr-2 text-green-600"></i>
                      Informations Matériel
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{ticketSelectionne.typeMatériel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priorité:</span>
                        <span className="font-medium">{ticketSelectionne.priorité}</span>
                      </div>
                      {ticketSelectionne.technicienAssigné && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Technicien:</span>
                          <span className="font-medium">{ticketSelectionne.technicienAssigné}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="ri-time-line mr-2 text-purple-600"></i>
                    Chronologie
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Incident signalé</div>
                        <div className="text-xs text-gray-500">
                          {ticketSelectionne.dateCreation.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateCreation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {ticketSelectionne.dateAssignation && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Incident assigné</div>
                          <div className="text-xs text-gray-500">
                            {ticketSelectionne.dateAssignation.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateAssignation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}

                    {ticketSelectionne.dateResolution && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Incident résolu</div>
                          <div className="text-xs text-gray-500">
                            {ticketSelectionne.dateResolution.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateResolution.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}

                    {ticketSelectionne.dateCloture && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Incident clôturé</div>
                          <div className="text-xs text-gray-500">
                            {ticketSelectionne.dateCloture.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateCloture.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SLA Information */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <i className="ri-calendar-check-line mr-2 text-orange-600"></i>
                    Informations SLA
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Statut SLA:</span>
                      <span className={`ml-2 font-medium ${getSlaColor(ticketSelectionne.slaStatut)}`}>
                        {ticketSelectionne.slaStatut}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Temps restant:</span>
                      <span className="ml-2 font-medium">{ticketSelectionne.tempsRestant}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={fermerModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Fermer
                  </button>
                  {peutModifier() && (
                    <button 
                      onClick={() => ouvrirModification(ticketSelectionne)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                      title="Modifier l'incident"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Modifier
                    </button>
                  )}

                  {!peutModifier() && (
                    <button 
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed whitespace-nowrap"
                      title="Seuls les administrateurs et techniciens peuvent modifier les incidents"
                    >
                      <i className="ri-lock-line mr-2"></i>
                      Modifier (Accès restreint)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de modification */}
        {modalModification && ticketModification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Modifier l'incident {ticketModification.id}</h2>
                  <button
                    onClick={fermerModalModification}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom et prénom
                    </label>
                    <input
                      type="text"
                      value={ticketModification.nomPrenom}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, nomPrenom: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Département
                    </label>
                    <select
                      value={ticketModification.departement}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, departement: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Direction Générale">Direction Générale</option>
                      <option value="Direction Opérationnel">Direction Opérationnel</option>
                      <option value="Département des Systèmes d'Information, Data et Intelligence Artificiel">Département des Systèmes d'Information, Data et Intelligence Artificiel</option>
                      <option value="Département Administratif et RH">Département Administratif et RH</option>
                      <option value="Département Commercial">Département Commercial</option>
                      <option value="Pôle Finance Publique">Pôle Finance Publique</option>
                      <option value="Pôle Décentralisation et Développement Local">Pôle Décentralisation et Développement Local</option>
                      <option value="Pôle Modélisation">Pôle Modélisation</option>
                      <option value="Pôle Nutrition">Pôle Nutrition</option>
                      <option value="Pôle Education">Pôle Education</option>
                      <option value="Pole Enquête et Monitoring">Pole Enquête et Monitoring</option>
                      <option value="Pôle Climat">Pôle Climat</option>
                                              <option value="Pôle Wash">Pôle Wash</option>
                        <option value="Pôle cohésion sociale">Pôle cohésion sociale</option>
                        <option value="Département Comptable et Finance">Département Comptable et Finance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poste
                    </label>
                    <input
                      type="text"
                      value={ticketModification.poste}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, poste: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de matériel
                    </label>
                    <select
                      value={ticketModification.typeMatériel}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, typeMatériel: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ordinateur Portable">Ordinateur Portable</option>
                      <option value="Ordinateur de Bureau">Ordinateur de Bureau</option>
                      <option value="Station de Travail">Station de Travail</option>
                      <option value="Serveur">Serveur</option>
                      <option value="Imprimante">Imprimante</option>
                      <option value="Scanner">Scanner</option>
                      <option value="Écran">Écran</option>
                      <option value="Projecteur">Projecteur</option>
                      <option value="Tablette">Tablette</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Routeur">Routeur</option>
                      <option value="Switch">Switch</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={ticketModification.description}
                    onChange={(e) => setTicketModification(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      value={ticketModification.priorité}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, priorité: e.target.value as 'Basse' | 'Moyenne' | 'Haute' | 'Urgente' } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Basse">Basse</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Haute">Haute</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      État
                    </label>
                    <select
                      value={ticketModification.état}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, état: e.target.value as Ticket['état'] } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Nouveau">Nouveau</option>
                      <option value="Assigné">Assigné</option>
                      <option value="En cours">En cours</option>
                      <option value="En attente de pièce">En attente de pièce</option>
                      <option value="Résolu">Résolu</option>
                      <option value="Clôturé">Clôturé</option>
                    </select>
                  </div>
                </div>

                {estAdministrateur() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technicien assigné
                    </label>
                    <select
                      value={ticketModification.technicienAssigné || ''}
                      onChange={(e) => setTicketModification(prev => prev ? { ...prev, technicienAssigné: e.target.value || undefined } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aucun technicien assigné</option>
                      {techniciens.map(tech => (
                        <option key={tech.id} value={tech.name}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={fermerModalModification}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sauvegarderModification}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informations SLA */}
        <div className="bg-gray-100 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Informations SLA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Prise en charge</h3>
                <p className="text-gray-600 text-sm mb-2">Nouveau → Assigné</p>
                <p className="text-lg font-medium text-blue-600">4h ouvrées</p>
                <p className="text-xs text-gray-500 mt-1">Relance à 6h</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Résolution</h3>
                <p className="text-gray-600 text-sm mb-2">Nouveau → Résolu</p>
                <p className="text-lg font-medium text-green-600">48h ouvrées</p>
                <p className="text-xs text-gray-500 mt-1">Escalade à 72h</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Validation</h3>
                <p className="text-gray-600 text-sm mb-2">Résolu → Clôturé</p>
                <p className="text-lg font-medium text-orange-600">24h</p>
                <p className="text-xs text-gray-500 mt-1">Clôture auto à 48h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiviPage;
