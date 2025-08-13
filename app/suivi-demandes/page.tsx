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
  état: 'Nouveau' | 'Assigné' | 'En cours' | 'En attente de pièce' | 'Résolu' | 'Clôturé' | 'Approuvé' | 'Rejeté';
  technicienAssigné?: string;
  dateCreation: Date;
  dateAssignation?: Date;
  dateResolution?: Date;
  dateCloture?: Date;
  slaStatut: 'OK' | 'Attention' | 'Dépassé';
  tempsRestant: string;
}

const SuiviDemandesPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtreEtat, setFiltreEtat] = useState<string>('Tous');
  const [filtrePriorité, setFiltrePriorité] = useState<string>('Tous');
  const [filtreDepartement, setFiltreDepartement] = useState<string>('Tous');
  const [filtreNomPrenom, setFiltreNomPrenom] = useState<string>('Tous');
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [recherche, setRecherche] = useState('');
  const [ticketSelectionne, setTicketSelectionne] = useState<Ticket | null>(null);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<any>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [emailConnexion, setEmailConnexion] = useState('');
  const [motDePasseConnexion, setMotDePasseConnexion] = useState('');
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);

  // Charger l'utilisateur connecté et les utilisateurs
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('utilisateur_connecte_amd');
    if (utilisateurSauvegarde) {
      setUtilisateurConnecte(JSON.parse(utilisateurSauvegarde));
    }

    const utilisateursSauvegardes = localStorage.getItem('utilisateurs_amd');
    if (utilisateursSauvegardes) {
      setUtilisateurs(JSON.parse(utilisateursSauvegardes));
    }
  }, []);

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
        
        // Convertir les données de l'API au format attendu et filtrer uniquement les demandes de matériel
        const convertedTickets: Ticket[] = data
          .filter((ticket: any) => ticket.catégorie === 'Demande de matériel')
          .map((ticket: any) => ({
            id: ticket.id,
            nomPrenom: ticket.nomPrenom,
            departement: ticket.departement,
            poste: ticket.poste || 'Non spécifié',
            typeMatériel: ticket.typeMatériel,
            description: ticket.description,
            priorité: ticket.priorité,
            catégorie: ticket.catégorie,
            état: ticket.état,
            technicienAssigné: ticket.technicienAssigné,
            dateCreation: new Date(ticket.dateCreation),
            slaStatut: 'OK' as const,
            tempsRestant: '24h'
          }));
        
        setTickets(convertedTickets);
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
        // En cas d'erreur, utiliser des données simulées pour les demandes
        const mockTickets: Ticket[] = [
          {
            id: 'DM-2024-001',
            nomPrenom: 'Jean Dupont',
            departement: 'Pôle Finance Publique',
            poste: 'Analyste Financier',
            typeMatériel: 'Ordinateur Portable',
            description: 'Demande d\'un nouvel ordinateur portable pour remplacement',
            priorité: 'Moyenne',
            catégorie: 'Demande de matériel',
            état: 'En cours',
            technicienAssigné: 'Sophie Chen',
            dateCreation: new Date(2024, 0, 15, 9, 30),
            dateAssignation: new Date(2024, 0, 15, 11, 15),
            slaStatut: 'OK',
            tempsRestant: '18h 30min'
          },
          {
            id: 'DM-2024-002',
            nomPrenom: 'Marie Martin',
            departement: 'Département Commercial',
            poste: 'Commercial',
            typeMatériel: 'Tablette',
            description: 'Demande d\'une tablette pour les présentations clients',
            priorité: 'Haute',
            catégorie: 'Demande de matériel',
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

  const ticketsFiltres = tickets.filter(ticket => {
    const matchEtat = filtreEtat === 'Tous' || ticket.état === filtreEtat;
    const matchPriorité = filtrePriorité === 'Tous' || ticket.priorité === filtrePriorité;
    const matchDepartement = filtreDepartement === 'Tous' || ticket.departement === filtreDepartement;
    const matchNomPrenom = filtreNomPrenom === 'Tous' || ticket.nomPrenom === filtreNomPrenom;
    
    // Filtre par période
    let matchPeriode = true;
    if (dateDebut && dateFin) {
      const dateTicket = ticket.dateCreation;
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59); // Inclure toute la journée de fin
      matchPeriode = dateTicket >= debut && dateTicket <= fin;
    } else if (dateDebut) {
      const dateTicket = ticket.dateCreation;
      const debut = new Date(dateDebut);
      matchPeriode = dateTicket >= debut;
    } else if (dateFin) {
      const dateTicket = ticket.dateCreation;
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59);
      matchPeriode = dateTicket <= fin;
    }
    
    const matchRecherche = ticket.nomPrenom.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.departement.toLowerCase().includes(recherche.toLowerCase()) ||
                          ticket.poste.toLowerCase().includes(recherche.toLowerCase());

    return matchEtat && matchPriorité && matchDepartement && matchNomPrenom && matchPeriode && matchRecherche;
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

  const états = ['Nouveau', 'Assigné', 'En cours', 'En attente de pièce', 'Résolu', 'Clôturé', 'Approuvé'];
  const priorités = ['Basse', 'Moyenne', 'Haute', 'Urgente'];
  const statutsDisponibles = ['Nouveau', 'Assigné', 'En cours', 'En attente de pièce', 'Résolu', 'Clôturé', 'Approuvé'];
  
  // Obtenir les listes uniques des départements et noms
  const departements = ['Tous', ...Array.from(new Set(tickets.map(t => t.departement)))];
  const nomsPrenoms = ['Tous', ...Array.from(new Set(tickets.map(t => t.nomPrenom)))];

  // Fonction de connexion
  const seConnecter = () => {
    const utilisateur = utilisateurs.find(u => 
      u.email === emailConnexion && u.motDePasse === motDePasseConnexion
    );

    if (utilisateur) {
      setUtilisateurConnecte(utilisateur);
      localStorage.setItem('utilisateur_connecte_amd', JSON.stringify(utilisateur));
      setModalConnexion(false);
      setEmailConnexion('');
      setMotDePasseConnexion('');
    } else {
      alert('Email ou mot de passe incorrect');
    }
  };

  // Fonction de déconnexion
  const seDeconnecter = () => {
    setUtilisateurConnecte(null);
    localStorage.removeItem('utilisateur_connecte_amd');
  };

  // Vérifier si l'utilisateur a accès à la page
  const aAccesSuiviDemandes = () => {
    return utilisateurConnecte && (
      utilisateurConnecte.role === 'administrateur' || 
      utilisateurConnecte.role === 'chargé d\'acquisition'
    );
  };

  // Fonctions d'action sur les tickets
  const approuverDemande = async (ticketId: string) => {
    try {
      const API_BASE_URL = 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ état: 'Approuvé' }),
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, état: 'Approuvé' as any }
              : ticket
          )
        );
        alert('Demande approuvée avec succès');
      } else if (response.status === 404) {
        // Si l'endpoint n'existe pas, mettre à jour localement seulement
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, état: 'Approuvé' as any }
              : ticket
          )
        );
        alert('Demande approuvée avec succès (mise à jour locale)');
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message) {
          alert(`Erreur lors de l'approbation: ${errorData.message}`);
        } else {
          alert(`Erreur lors de l'approbation (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur de connexion, mettre à jour localement
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, état: 'Approuvé' as any }
            : ticket
        )
      );
      alert('Demande approuvée avec succès (mise à jour locale - backend non disponible)');
    }
  };

  const rejeterDemande = async (ticketId: string) => {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      try {
        const API_BASE_URL = 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ état: 'Rejeté' }),
        });

        if (response.ok) {
          // Mettre à jour l'état local
          setTickets(prevTickets => 
            prevTickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, état: 'Rejeté' as any }
                : ticket
            )
          );
          alert('Demande rejetée');
        } else if (response.status === 404) {
          // Si l'endpoint n'existe pas, mettre à jour localement seulement
          setTickets(prevTickets => 
            prevTickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, état: 'Rejeté' as any }
                : ticket
            )
          );
          alert('Demande rejetée (mise à jour locale)');
        } else {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.message) {
            alert(`Erreur lors du rejet: ${errorData.message}`);
          } else {
            alert(`Erreur lors du rejet (${response.status})`);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        // En cas d'erreur de connexion, mettre à jour localement
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, état: 'Rejeté' as any }
              : ticket
          )
        );
        alert('Demande rejetée (mise à jour locale - backend non disponible)');
      }
    }
  };

  // Fonction pour changer le statut d'un ticket
  const changerStatut = async (ticketId: string, nouveauStatut: string) => {
    try {
      // Essayer d'abord l'API backend
      const API_BASE_URL = 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ état: nouveauStatut }),
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, état: nouveauStatut as any }
              : ticket
          )
        );
        alert(`Statut changé avec succès vers "${nouveauStatut}"`);
      } else if (response.status === 404) {
        // Si l'endpoint n'existe pas, mettre à jour localement seulement
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, état: nouveauStatut as any }
              : ticket
          )
        );
        alert(`Statut changé avec succès vers "${nouveauStatut}" (mise à jour locale)`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message) {
          alert(`Erreur lors du changement de statut: ${errorData.message}`);
        } else {
          alert(`Erreur lors du changement de statut (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur de connexion, mettre à jour localement
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, état: nouveauStatut as any }
            : ticket
        )
      );
      alert(`Statut changé avec succès vers "${nouveauStatut}" (mise à jour locale - backend non disponible)`);
    }
  };

  const ouvrirDetails = (ticket: Ticket) => {
    setTicketSelectionne(ticket);
    setModalOuverte(true);
  };

  const fermerModal = () => {
    setModalOuverte(false);
    setTicketSelectionne(null);
  };

  // Fonction pour calculer le temps moyen de résolution (en heures)
  const calculerTempsMoyenResolution = () => {
    const ticketsResolus = tickets.filter(t => 
      t.état === 'Résolu' || t.état === 'Clôturé' || t.état === 'Approuvé'
    );
    
    if (ticketsResolus.length === 0) return 0;
    
    const tempsTotal = ticketsResolus.reduce((total, ticket) => {
      const dateResolution = ticket.dateResolution || ticket.dateCloture || new Date();
      const tempsResolution = dateResolution.getTime() - ticket.dateCreation.getTime();
      return total + tempsResolution;
    }, 0);
    
    const tempsMoyenHeures = tempsTotal / ticketsResolus.length / (1000 * 60 * 60);
    return Math.round(tempsMoyenHeures * 10) / 10; // Arrondir à 1 décimale
  };

  // Fonction pour calculer le taux de satisfaction par catégorie
  const calculerTauxSatisfaction = (categorie: string) => {
    // Simulation du taux de satisfaction basé sur l'état des tickets
    const ticketsCategorie = tickets.filter(t => t.catégorie === categorie);
    
    if (ticketsCategorie.length === 0) return 0;
    
    // Logique de satisfaction : 
    // - Résolu/Clôturé/Approuvé = 100% satisfaction
    // - En cours = 75% satisfaction
    // - Assigné = 50% satisfaction
    // - Nouveau/En attente = 25% satisfaction
    const satisfactionTotale = ticketsCategorie.reduce((total, ticket) => {
      let satisfaction = 0;
      switch (ticket.état) {
        case 'Résolu':
        case 'Clôturé':
        case 'Approuvé':
          satisfaction = 100;
          break;
        case 'En cours':
          satisfaction = 75;
          break;
        case 'Assigné':
          satisfaction = 50;
          break;
        case 'Nouveau':
        case 'En attente de pièce':
          satisfaction = 25;
          break;
        default:
          satisfaction = 0;
      }
      return total + satisfaction;
    }, 0);
    
    return Math.round(satisfactionTotale / ticketsCategorie.length);
  };

  // Fonction pour obtenir les statistiques par catégorie
  const obtenirStatistiquesCategorie = (categorie: string) => {
    const ticketsCategorie = tickets.filter(t => t.catégorie === categorie);
    
    return {
      total: ticketsCategorie.length,
      resolus: ticketsCategorie.filter(t => t.état === 'Résolu').length,
      clotures: ticketsCategorie.filter(t => t.état === 'Clôturé').length,
      enAttente: ticketsCategorie.filter(t => 
        t.état === 'Nouveau' || t.état === 'Assigné' || t.état === 'En attente de pièce'
      ).length,
      enCours: ticketsCategorie.filter(t => t.état === 'En cours').length,
      approuves: ticketsCategorie.filter(t => t.état === 'Approuvé').length
    };
  };

  // Fonction pour réinitialiser tous les filtres
  const reinitialiserFiltres = () => {
    setFiltreEtat('Tous');
    setFiltrePriorité('Tous');
    setFiltreDepartement('Tous');
    setFiltreNomPrenom('Tous');
    setDateDebut('');
    setDateFin('');
    setRecherche('');
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
              <Link href="/suivi" className="text-gray-600 hover:text-gray-900">Suivi des Incidents</Link>
              <Link href="/suivi-demandes" className="text-red-600 font-medium">Suivi des Demandes</Link>
              <Link href="/gestion-comptes" className="text-gray-600 hover:text-gray-900">Gestion des comptes</Link>

              {/* Authentification */}
              {utilisateurConnecte ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Connecté: <span className="font-medium">{utilisateurConnecte.nom}</span>
                    <span className="text-xs text-gray-500 ml-1">({utilisateurConnecte.role})</span>
                  </span>
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

      {/* En-tête */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suivi des Demandes</h1>
              <p className="text-gray-600 mt-2">Gérez et suivez l'état de toutes les demandes de matériel</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-50 px-4 py-2 rounded-lg">
                <span className="text-orange-600 font-medium">{ticketsFiltres.length} demandes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!utilisateurConnecte ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <i className="ri-lock-line text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
            <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder au suivi des demandes.</p>
            <button
              onClick={() => setModalConnexion(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
            >
              <i className="ri-login-box-line mr-2"></i>
              Se connecter
            </button>
          </div>
        ) : !aAccesSuiviDemandes() ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <i className="ri-shield-check-line text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès insuffisant</h3>
            <p className="text-gray-600">Seuls les administrateurs et chargés d'acquisition peuvent accéder au suivi des demandes.</p>
          </div>
        ) : (
          <>
                                   {/* Statistiques */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white rounded-lg shadow-sm p-6 border">
             <div className="flex items-center">
               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                 <i className="ri-file-list-line text-blue-600 text-xl"></i>
               </div>
               <div className="ml-4">
                 <p className="text-sm text-gray-600">Total Demandes</p>
                 <p className="text-2xl font-bold text-blue-600">{tickets.length}</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm p-6 border">
             <div className="flex items-center">
               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                 <i className="ri-check-line text-green-600 text-xl"></i>
               </div>
               <div className="ml-4">
                 <p className="text-sm text-gray-600">Approuvées/Résolues</p>
                 <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.état === 'Résolu' || t.état === 'Clôturé' || t.état === 'Approuvé').length}</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm p-6 border">
             <div className="flex items-center">
               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                 <i className="ri-time-line text-purple-600 text-xl"></i>
               </div>
               <div className="ml-4">
                 <p className="text-sm text-gray-600">Temps moyen de résolution</p>
                 <p className="text-2xl font-bold text-purple-600">{calculerTempsMoyenResolution()}h</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm p-6 border">
             <div className="flex items-center">
               <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                 <i className="ri-heart-line text-orange-600 text-xl"></i>
               </div>
               <div className="ml-4">
                 <p className="text-sm text-gray-600">Satisfaction globale</p>
                 <p className="text-2xl font-bold text-orange-600">{calculerTauxSatisfaction('Demande de matériel')}%</p>
               </div>
             </div>
           </div>
         </div>

                   {/* Statistiques par catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-shopping-cart-line mr-2 text-blue-600"></i>
                Demandes de Matériel
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-blue-600">{tickets.filter(t => t.catégorie === 'Demande de matériel').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-xl font-bold text-green-600">{calculerTauxSatisfaction('Demande de matériel')}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-tools-line mr-2 text-orange-600"></i>
                Incidents Signalés
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-orange-600">{tickets.filter(t => t.catégorie === 'Signaler un problème technique').length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-xl font-bold text-green-600">{calculerTauxSatisfaction('Signaler un problème technique')}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques de comparaison détaillées */}
          <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <i className="ri-bar-chart-line mr-2 text-purple-600"></i>
              Comparaison Détaillée : Incidents vs Demandes
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Incidents Signalés */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-tools-line mr-2 text-orange-600"></i>
                  Incidents Signalés
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total incidents</span>
                    <span className="text-lg font-bold text-orange-600">{obtenirStatistiquesCategorie('Signaler un problème technique').total}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Résolus</span>
                    <span className="text-lg font-bold text-green-600">{obtenirStatistiquesCategorie('Signaler un problème technique').resolus}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Clôturés</span>
                    <span className="text-lg font-bold text-gray-600">{obtenirStatistiquesCategorie('Signaler un problème technique').clotures}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">En attente</span>
                    <span className="text-lg font-bold text-yellow-600">{obtenirStatistiquesCategorie('Signaler un problème technique').enAttente}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">En cours</span>
                    <span className="text-lg font-bold text-blue-600">{obtenirStatistiquesCategorie('Signaler un problème technique').enCours}</span>
                  </div>
                </div>
              </div>

              {/* Demandes de Matériel */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-shopping-cart-line mr-2 text-blue-600"></i>
                  Demandes de Matériel
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Total demandes</span>
                    <span className="text-lg font-bold text-blue-600">{obtenirStatistiquesCategorie('Demande de matériel').total}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Résolus</span>
                    <span className="text-lg font-bold text-green-600">{obtenirStatistiquesCategorie('Demande de matériel').resolus}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Clôturés</span>
                    <span className="text-lg font-bold text-gray-600">{obtenirStatistiquesCategorie('Demande de matériel').clotures}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">En attente</span>
                    <span className="text-lg font-bold text-yellow-600">{obtenirStatistiquesCategorie('Demande de matériel').enAttente}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Approuvés</span>
                    <span className="text-lg font-bold text-purple-600">{obtenirStatistiquesCategorie('Demande de matériel').approuves}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé comparatif */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Résumé Comparatif</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-800">{tickets.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {obtenirStatistiquesCategorie('Signaler un problème technique').total} incidents + {obtenirStatistiquesCategorie('Demande de matériel').total} demandes
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tickets Terminés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {obtenirStatistiquesCategorie('Signaler un problème technique').resolus + obtenirStatistiquesCategorie('Signaler un problème technique').clotures + 
                     obtenirStatistiquesCategorie('Demande de matériel').resolus + obtenirStatistiquesCategorie('Demande de matériel').clotures + obtenirStatistiquesCategorie('Demande de matériel').approuves}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Résolus + Clôturés + Approuvés</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tickets en Attente</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {obtenirStatistiquesCategorie('Signaler un problème technique').enAttente + obtenirStatistiquesCategorie('Demande de matériel').enAttente}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Nouveau + Assigné + En attente</p>
                </div>
              </div>
            </div>
          </div>

                 {/* Diagramme des demandes par état */}
         <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
           <h2 className="text-lg font-bold text-gray-900 mb-4">Répartition des Demandes par État</h2>
           <ResponsiveContainer width="100%" height={250}>
             <BarChart
               data={[
                 {
                   name: 'Demandes',
                   "Nouveau": tickets.filter(t => t.état === 'Nouveau').length,
                   "Assigné": tickets.filter(t => t.état === 'Assigné').length,
                   "En cours": tickets.filter(t => t.état === 'En cours').length,
                   "En attente de pièce": tickets.filter(t => t.état === 'En attente de pièce').length,
                   "Résolu/Clôturé": tickets.filter(t => t.état === 'Résolu' || t.état === 'Clôturé' || t.état === 'Approuvé').length
                 }
               ]}
               margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
             >
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="name" />
               <YAxis allowDecimals={false} />
               <Tooltip />
               <Legend />
               <Bar dataKey="Nouveau" fill="#3b82f6" />
               <Bar dataKey="Assigné" fill="#8b5cf6" />
               <Bar dataKey="En cours" fill="#f59e0b" />
               <Bar dataKey="En attente de pièce" fill="#f97316" />
               <Bar dataKey="Résolu/Clôturé" fill="#22c55e" />
             </BarChart>
           </ResponsiveContainer>
         </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtres de recherche</h3>
          </div>
          
          {/* Première ligne de filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recherche générale</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="Rechercher par ID, nom, description..."
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
              <select
                value={filtreDepartement}
                onChange={(e) => setFiltreDepartement(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                {departements.map(departement => (
                  <option key={departement} value={departement}>{departement}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deuxième ligne de filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom et prénoms</label>
              <select
                value={filtreNomPrenom}
                onChange={(e) => setFiltreNomPrenom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm pr-8"
              >
                {nomsPrenoms.map(nom => (
                  <option key={nom} value={nom}>{nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button 
                onClick={reinitialiserFiltres}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>
                Réinitialiser
              </button>
              <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap">
                <i className="ri-search-line mr-2"></i>
                Filtrer
              </button>
            </div>
          </div>

          {/* Résumé des filtres actifs */}
          {(filtreEtat !== 'Tous' || filtrePriorité !== 'Tous' || filtreDepartement !== 'Tous' || 
            filtreNomPrenom !== 'Tous' || dateDebut || dateFin || recherche) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="ri-filter-line text-blue-600 mr-2"></i>
                  <span className="text-sm font-medium text-blue-800">Filtres actifs :</span>
                </div>
                <button 
                  onClick={reinitialiserFiltres}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Effacer tous les filtres
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {filtreEtat !== 'Tous' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    État: {filtreEtat}
                  </span>
                )}
                {filtrePriorité !== 'Tous' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Priorité: {filtrePriorité}
                  </span>
                )}
                {filtreDepartement !== 'Tous' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Département: {filtreDepartement}
                  </span>
                )}
                {filtreNomPrenom !== 'Tous' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Nom: {filtreNomPrenom}
                  </span>
                )}
                {dateDebut && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    À partir du: {new Date(dateDebut).toLocaleDateString('fr-FR')}
                  </span>
                )}
                {dateFin && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Jusqu'au: {new Date(dateFin).toLocaleDateString('fr-FR')}
                  </span>
                )}
                {recherche && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Recherche: "{recherche}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {ticketsFiltres.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.id}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Demandeur:</span>
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
                        <span className="text-gray-500">Matériel demandé:</span>
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
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200">
                      Demande de matériel
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
                  </div>

                                     <div className="flex items-center space-x-2">
                     <button
                       onClick={() => ouvrirDetails(ticket)}
                       className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                     >
                       <i className="ri-eye-line mr-1"></i>
                       Détails
                     </button>
                     
                     {/* Bouton de changement de statut */}
                     <div className="relative group">
                       <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors whitespace-nowrap cursor-pointer flex items-center">
                         <i className="ri-settings-3-line mr-1"></i>
                         Statut
                         <i className="ri-arrow-down-s-line ml-1"></i>
                       </button>
                       
                       {/* Menu déroulant des statuts */}
                       <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                         {statutsDisponibles.map((statut) => (
                           <button
                             key={statut}
                             onClick={() => changerStatut(ticket.id, statut)}
                             className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                               ticket.état === statut ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                             }`}
                           >
                             {statut}
                           </button>
                         ))}
                       </div>
                     </div>
                     
                     {/* Boutons d'action pour les demandes en attente */}
                     {ticket.état === 'Nouveau' && (
                       <>
                         <button
                           onClick={() => approuverDemande(ticket.id)}
                           className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors whitespace-nowrap cursor-pointer"
                         >
                           <i className="ri-check-line mr-1"></i>
                           Approuver
                         </button>
                         <button
                           onClick={() => rejeterDemande(ticket.id)}
                           className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors whitespace-nowrap cursor-pointer"
                         >
                           <i className="ri-close-line mr-1"></i>
                           Rejeter
                         </button>
                       </>
                     )}
                   </div>
                </div>
              </div>
            </div>
          ))}

          {ticketsFiltres.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <i className="ri-search-line text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-600">Aucune demande ne correspond aux critères de recherche.</p>
            </div>
          )}
        </div>
          </>
        )}

        {/* Modal des détails */}
        {modalOuverte && ticketSelectionne && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de la Demande</h2>
                  <button
                    onClick={fermerModal}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* En-tête de la demande */}
                <div className="bg-orange-50 rounded-lg p-6">
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

                {/* Informations demandeur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="ri-user-line mr-2 text-blue-600"></i>
                      Informations Demandeur
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
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="ri-shopping-cart-line mr-2 text-orange-600"></i>
                      Détails de la Demande
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Matériel demandé:</span>
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
                        <div className="text-sm font-medium text-gray-900">Demande créée</div>
                        <div className="text-xs text-gray-500">
                          {ticketSelectionne.dateCreation.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateCreation.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {ticketSelectionne.dateAssignation && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Demande assignée</div>
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
                          <div className="text-sm font-medium text-gray-900">Demande approuvée</div>
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
                          <div className="text-sm font-medium text-gray-900">Demande clôturée</div>
                          <div className="text-xs text-gray-500">
                            {ticketSelectionne.dateCloture.toLocaleDateString('fr-FR')} à {ticketSelectionne.dateCloture.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={fermerModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de connexion */}
        {modalConnexion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Connexion</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={motDePasseConnexion}
                    onChange={(e) => setMotDePasseConnexion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Votre mot de passe"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={seConnecter}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-login-box-line mr-2"></i>
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuiviDemandesPage;
