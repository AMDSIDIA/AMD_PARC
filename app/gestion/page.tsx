'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import IncidentManagement from '@/components/IncidentManagement';
import InventoryManagement from '@/components/InventoryManagement';

interface Incident {
  ticketId: string;
  descriptionSouci: string;
  prenom: string;
  nom: string;
  priorite: string;
  status: string;
  assignedTo: string;
}

interface Technician {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  status: string;
  condition: string;
  assignedTo: string | null;
}

export default function GestionTechnique() {
  const [incidents] = useState<Incident[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('incidents');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // États pour l'authentification locale
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<any>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [emailConnexion, setEmailConnexion] = useState('');
  const [motDePasseConnexion, setMotDePasseConnexion] = useState('');
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);

  // États pour les filtres
  const [filtreNomPrenom, setFiltreNomPrenom] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Fonction utilitaire pour recharger les tickets
  const reloadTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tickets');
      if (response.ok) {
        const data = await response.json();
        const ticketsWithTechnician = data.map((ticket: any) => ({
          ...ticket,
          technicienAssigné: ticket.technicienAssigné || null
        }));
        setTickets(ticketsWithTechnician);
      }
    } catch (e) {
      console.error('Erreur lors du rechargement des tickets:', e);
    }
  };

  // Fonction de test pour assigner un technicien (pour debug)
  const testAssignTechnician = (ticketId: string, technicienName: string) => {
    console.log('Test assignation:', { ticketId, technicienName }); // Debug
    setTickets(prevTickets => {
      const updatedTickets = prevTickets.map(ticket => {
        if (ticket.id === ticketId) {
          console.log('Test: Mise à jour du ticket:', ticket.id, 'avec technicien:', technicienName); // Debug
          return { ...ticket, technicienAssigné: technicienName, état: 'Assigné' };
        }
        return ticket;
      });
      console.log('Test: Tickets mis à jour:', updatedTickets); // Debug
      return updatedTickets;
    });
  };

  // Fonction pour filtrer les tickets
  const ticketsFiltres = tickets.filter(ticket => {
    // Filtre par nom et prénom
    if (filtreNomPrenom && !ticket.nomPrenom?.toLowerCase().includes(filtreNomPrenom.toLowerCase())) {
      return false;
    }

    // Filtre par statut
    if (filtreStatut && ticket.état !== filtreStatut) {
      return false;
    }

    // Filtre par période
    if (dateDebut || dateFin) {
      const dateTicket = new Date(ticket.dateCreation);
      
      if (dateDebut) {
        const debut = new Date(dateDebut);
        if (dateTicket < debut) {
          return false;
        }
      }
      
      if (dateFin) {
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
        if (dateTicket > fin) {
          return false;
        }
      }
    }

    return true;
  });

  // Fonction pour réinitialiser les filtres
  const reinitialiserFiltres = () => {
    setFiltreNomPrenom('');
    setFiltreStatut('');
    setDateDebut('');
    setDateFin('');
  };

  // Fonction pour obtenir les statuts uniques
  const statutsUniques = [...new Set(tickets.map(ticket => ticket.état))].filter(Boolean);

  // Charger l'utilisateur connecté depuis le localStorage
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('utilisateur_connecte_amd');
    if (utilisateurSauvegarde) {
      setUtilisateurConnecte(JSON.parse(utilisateurSauvegarde));
    }
  }, []);

  // Charger les utilisateurs depuis le localStorage
  useEffect(() => {
    const utilisateursSauvegardes = localStorage.getItem('utilisateurs_amd');
    if (utilisateursSauvegardes) {
      setUtilisateurs(JSON.parse(utilisateursSauvegardes));
    }
  }, []);

  // Fonction de connexion locale
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

  // Vérifier si l'utilisateur a les droits d'accès
  const aAccesGestionTechnique = () => {
    return utilisateurConnecte && (
      utilisateurConnecte.role === 'administrateur' ||
      utilisateurConnecte.role === 'technicien'
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Tentative de connexion au backend:', API_BASE_URL);
      
      const [incidentsRes, techniciansRes, inventoryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/incidents`),
        fetch(`${API_BASE_URL}/api/technicians`),
        fetch(`${API_BASE_URL}/api/inventory`)
      ]);

      if (!incidentsRes.ok) {
        const errorText = await incidentsRes.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || `Erreur incidents: ${incidentsRes.status}`;
        } catch {
          errorMessage = `Erreur incidents: ${incidentsRes.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
      if (!techniciansRes.ok) {
        const errorText = await techniciansRes.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || `Erreur techniciens: ${techniciansRes.status}`;
        } catch {
          errorMessage = `Erreur techniciens: ${techniciansRes.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
      if (!inventoryRes.ok) {
        const errorText = await inventoryRes.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || `Erreur inventaire: ${inventoryRes.status}`;
        } catch {
          errorMessage = `Erreur inventaire: ${inventoryRes.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const incidentsData = await incidentsRes.json();
      const techniciansData = await techniciansRes.json();
      const inventoryData = await inventoryRes.json();

      console.log('Techniciens chargés:', techniciansData); // Debug
      console.log('Incidents chargés:', incidentsData); // Debug

      setIncidents(incidentsData);
      
      // Utiliser les techniciens de l'API ou des techniciens par défaut
      if (techniciansData && techniciansData.length > 0) {
        setTechnicians(techniciansData);
      } else {
        // Techniciens par défaut si l'API ne fonctionne pas
        const techniciensParDefaut = [
          { id: 'tech1', name: 'Jean Martin' },
          { id: 'tech2', name: 'Sophie Chen' },
          { id: 'tech3', name: 'Marc Thierry' },
          { id: 'tech4', name: 'Paul Durand' },
          { id: 'tech5', name: 'Lisa Bernard' }
        ];
        console.log('Utilisation des techniciens par défaut:', techniciensParDefaut); // Debug
        setTechnicians(techniciensParDefaut);
      }
      
      setInventory(inventoryData);
          } catch (err: unknown) {
        console.error('Erreur de connexion au backend:', err);
        
        // En cas d'erreur, utiliser des techniciens par défaut
        const techniciensParDefaut = [
          { id: 'tech1', name: 'Jean Martin' },
          { id: 'tech2', name: 'Sophie Chen' },
          { id: 'tech3', name: 'Marc Thierry' },
          { id: 'tech4', name: 'Paul Durand' },
          { id: 'tech5', name: 'Lisa Bernard' }
        ];
        console.log('Erreur API, utilisation des techniciens par défaut:', techniciensParDefaut); // Debug
        setTechnicians(techniciensParDefaut);
        
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError(`Impossible de se connecter au backend. Vérifiez que le serveur backend est démarré sur ${API_BASE_URL}`);
        } else {
          setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        }
      } finally {
        setLoading(false);
      }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tickets');
        if (!response.ok) throw new Error('Erreur de chargement des tickets');
        const data = await response.json();
        console.log('Tickets chargés:', data); // Debug
        
        // S'assurer que tous les tickets ont la propriété technicienAssigné
        const ticketsWithTechnician = data.map((ticket: any) => {
          console.log('Ticket original:', ticket); // Debug
          return {
            ...ticket,
            technicienAssigné: ticket.technicienAssigné || null
          };
        });
        
        console.log('Tickets avec technicien:', ticketsWithTechnician); // Debug
        setTickets(ticketsWithTechnician);
      } catch (e) {
        console.error('Erreur lors du chargement des tickets:', e);
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  const demandesMaterielEnCours = tickets.filter(
    t => t.catégorie === 'Demande de matériel' && t.état !== 'Résolu' && t.état !== 'Clôturé'
  ).length;
  const assistTechNonBouclee = tickets.filter(
    t => t.catégorie !== 'Demande de matériel' && t.état !== 'Résolu' && t.état !== 'Clôturé'
  ).length;
  const totalIncidents = tickets.length;
  const ticketsResolusCeMois = tickets.filter(t => {
    const now = new Date();
    const date = new Date(t.dateCreation);
    return (t.état === 'Résolu' || t.état === 'Clôturé') && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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

  const handleAssignIncident = async (ticketId: string, technicianId: string) => {
    if (!aAccesGestionTechnique()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent assigner des incidents');
      return;
    }

    try {
      // Trouver le technicien par son ID
      const technicien = technicians.find(t => t.id === technicianId);
      console.log('Technicien trouvé:', technicien); // Debug
      console.log('TechnicianId reçu:', technicianId); // Debug
      console.log('Techniciens disponibles:', technicians); // Debug
      
      if (!technicien) {
        alert('Technicien non trouvé');
        return;
      }

      // Mettre à jour localement d'abord
      setTickets(prevTickets => {
        console.log('Tickets avant mise à jour:', prevTickets); // Debug
        const updatedTickets = prevTickets.map(ticket => {
          if (ticket.id === ticketId) {
            console.log('Mise à jour du ticket:', ticket.id, 'avec technicien:', technicien.name); // Debug
            return { ...ticket, technicienAssigné: technicien.name, état: 'Assigné' };
          }
          return ticket;
        });
        console.log('Tickets mis à jour après assignation:', updatedTickets); // Debug
        return updatedTickets;
      });

      // Essayer de mettre à jour via l'API (optionnel)
      try {
        const response = await fetch(`${API_BASE_URL}/api/incidents/${ticketId}/assign`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ technicianId }),
        });

        if (!response.ok) {
          console.warn('API non disponible, mise à jour locale uniquement');
        } else {
          console.log('Mise à jour API réussie');
        }
      } catch (apiError) {
        console.warn('Erreur API, mise à jour locale uniquement:', apiError);
      }

      alert('Incident assigné avec succès !');
      
      // Recharger les tickets pour s'assurer que les données sont à jour
      setTimeout(() => {
        reloadTickets();
      }, 500);
    } catch (err: unknown) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleUpdateIncidentStatus = async (ticketId: string, status: string) => {
    if (!aAccesGestionTechnique()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent modifier le statut des incidents');
      return;
    }

    try {
      // Mettre à jour localement d'abord
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, état: status }
            : ticket
        )
      );

      // Essayer de mettre à jour via l'API
      try {
        const response = await fetch(`${API_BASE_URL}/api/incidents/${ticketId}/status`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          console.warn('API non disponible, mise à jour locale uniquement');
        }
      } catch (apiError) {
        console.warn('Erreur API, mise à jour locale uniquement:', apiError);
      }

      alert('Statut mis à jour !');
      
      // Recharger les tickets pour s'assurer que les données sont à jour
      setTimeout(() => {
        reloadTickets();
      }, 500);
    } catch (err: unknown) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const handleUpdateIncident = async (ticketId: string, updatedIncident: any) => {
    if (!aAccesGestionTechnique()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent modifier les incidents');
      return;
    }

    try {
      // Mettre à jour localement d'abord
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, ...updatedIncident }
            : ticket
        )
      );

      // Essayer de mettre à jour via l'API
      try {
        const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedIncident),
        });

        if (!response.ok) {
          console.warn('API non disponible, mise à jour locale uniquement');
        } else {
          console.log('Mise à jour API réussie');
        }
      } catch (apiError) {
        console.warn('Erreur API, mise à jour locale uniquement:', apiError);
      }

      // Recharger les tickets pour s'assurer que les données sont à jour
      setTimeout(() => {
        reloadTickets();
      }, 500);
      
      return true;
    } catch (err: unknown) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      return false;
    }
  };

  const handleAddInventoryItem = async (item: any): Promise<boolean> => {
    if (!aAccesGestionTechnique()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent ajouter des éléments à l\'inventaire');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || `Erreur: ${response.status}`;
        } catch {
          errorMessage = `Erreur: ${response.status} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      fetchData();
      return true;
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleUpdateInventoryItem = async (itemId: string, updatedItem: any) => {
    if (!aAccesGestionTechnique()) {
      alert('Accès refusé: Seuls les administrateurs et techniciens peuvent modifier l\'inventaire');
      return;
    }

    try {
      // Mettre à jour localement d'abord
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item.id === itemId ? { ...item, ...updatedItem } : item
        )
      );

      // Essayer de mettre à jour via l'API
      try {
        const response = await fetch(`${API_BASE_URL}/api/inventory/${itemId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedItem),
        });

        if (!response.ok) {
          console.warn('API non disponible, mise à jour locale uniquement');
        } else {
          console.log('Mise à jour API réussie');
        }
      } catch (apiError) {
        console.warn('Erreur API, mise à jour locale uniquement:', apiError);
      }

      alert('Équipement mis à jour avec succès !');
      return true;
    } catch (err: unknown) {
      alert(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto mt-8 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Erreur de connexion au backend</h3>
            <p className="mb-4">{error}</p>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">Pour résoudre ce problème :</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Ouvrez un terminal dans le dossier du projet</li>
                <li>Naviguez vers le dossier backend : <code className="bg-gray-100 px-1 rounded">cd backend</code></li>
                <li>Installez les dépendances : <code className="bg-gray-100 px-1 rounded">npm install</code></li>
                <li>Démarrez le serveur : <code className="bg-gray-100 px-1 rounded">npm start</code></li>
                <li>Vérifiez que le serveur est accessible sur <code className="bg-gray-100 px-1 rounded">http://localhost:5000</code></li>
                <li>Rechargez cette page</li>
              </ol>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Recharger la page
              </button>
                      </div>
        </div>
      </div>

      {/* Modal de connexion */}
      {modalConnexion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Connexion Gestion Technique</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="votre.email@amd-international.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={motDePasseConnexion}
                  onChange={(e) => setMotDePasseConnexion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Mot de passe"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Compte de test disponible:</h4>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> admin@amd-international.com<br />
                  <strong>Mot de passe:</strong> admin123
                </p>
              </div>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
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
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="cursor-pointer">
                <Image 
                  src="https://static.readdy.ai/image/1b1470ae2e6c51ef9abc425519678c59/ef4fe7e82dbc5a71c70987c5727051b9.png" 
                  alt="AMD International Logo" 
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
              </Link>
              <span className="ml-4 text-lg font-semibold text-gray-800">
                AMD International - Gestion Technique
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/signaler" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Signaler un problème
              </Link>
              <Link href="/suivi" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Suivi des incidents
              </Link>
              <Link href="/suivi-demandes" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Suivi des demandes
              </Link>
              <Link href="/gestion" className="text-indigo-600 font-medium cursor-pointer">
                Gestion technique
              </Link>
              <Link href="/gestion-comptes" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Gestion des comptes
              </Link>

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
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-login-box-line mr-2"></i>
                  Connexion
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

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
                  <strong>Accès restreint:</strong> Vous pouvez consulter les données mais seuls les administrateurs et techniciens peuvent effectuer des modifications.
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
      {utilisateurConnecte && !aAccesGestionTechnique() && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-information-line text-orange-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>Accès en lecture seule:</strong> Vous êtes connecté en tant que <strong>{utilisateurConnecte.role}</strong>. 
                  Seuls les administrateurs et techniciens peuvent modifier les données.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Gestion Technique
              </h1>
              <p className="text-gray-600">
                Gestion des incidents et de l&apos;inventaire technique
              </p>
            </div>

            {/* Statistiques globales */}
            <div className="grid md:grid-cols-4 gap-8 text-center mb-12">
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{loadingTickets ? '...' : demandesMaterielEnCours}</div>
                <div className="text-gray-600">Demandes de matériel en cours</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">{loadingTickets ? '...' : assistTechNonBouclee}</div>
                <div className="text-gray-600">Assistances techniques non bouclées</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">{loadingTickets ? '...' : totalIncidents}</div>
                <div className="text-gray-600">Tickets/incidents totaux</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{loadingTickets ? '...' : ticketsResolusCeMois}</div>
                <div className="text-gray-600">Tickets résolus ce mois</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">2.4h</div>
                <div className="text-gray-600">Temps de résolution moyen</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Taux de satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Support disponible</div>
              </div>
            </div>

            {/* Comparaison Détaillée : Incidents vs Demandes */}
            <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Comparaison Détaillée : Incidents vs Demandes</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Incidents Signalés */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <i className="ri-error-warning-line mr-2 text-blue-600"></i>
                    Incidents Signalés
                  </h3>
                  {(() => {
                    const stats = obtenirStatistiquesCategorie('Matériel');
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">Total:</span>
                          <span className="text-blue-900 font-bold text-lg">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Résolus:</span>
                          <span className="text-green-900 font-semibold">{stats.resolus}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Clôturés:</span>
                          <span className="text-gray-900 font-semibold">{stats.clotures}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">En attente:</span>
                          <span className="text-orange-900 font-semibold">{stats.enAttente}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-700">En cours:</span>
                          <span className="text-amber-900 font-semibold">{stats.enCours}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Demandes de Matériel */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <i className="ri-shopping-cart-line mr-2 text-orange-600"></i>
                    Demandes de Matériel
                  </h3>
                  {(() => {
                    const stats = obtenirStatistiquesCategorie('Demande de matériel');
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700 font-medium">Total:</span>
                          <span className="text-orange-900 font-bold text-lg">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Résolus:</span>
                          <span className="text-green-900 font-semibold">{stats.resolus}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Clôturés:</span>
                          <span className="text-gray-900 font-semibold">{stats.clotures}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">En attente:</span>
                          <span className="text-orange-900 font-semibold">{stats.enAttente}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-700">En cours:</span>
                          <span className="text-amber-900 font-semibold">{stats.enCours}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Approuvés:</span>
                          <span className="text-blue-900 font-semibold">{stats.approuves}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Résumé Comparatif */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="ri-bar-chart-line mr-2 text-gray-600"></i>
                  Résumé Comparatif
                </h3>
                {(() => {
                  const statsIncidents = obtenirStatistiquesCategorie('Matériel');
                  const statsDemandes = obtenirStatistiquesCategorie('Demande de matériel');
                  const totalTickets = statsIncidents.total + statsDemandes.total;
                  const totalTermines = statsIncidents.resolus + statsIncidents.clotures + statsDemandes.resolus + statsDemandes.clotures + statsDemandes.approuves;
                  const totalEnAttente = statsIncidents.enAttente + statsDemandes.enAttente;
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 mb-1">{totalTickets}</div>
                        <div className="text-sm text-gray-600">Total Tickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{totalTermines}</div>
                        <div className="text-sm text-gray-600">Tickets Terminés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">{totalEnAttente}</div>
                        <div className="text-sm text-gray-600">Tickets en Attente</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Navigation par onglets */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('incidents')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'incidents'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestion des Incidents
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inventory'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestion de l&apos;Inventaire
                </button>
              </nav>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'incidents' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Gestion des Incidents</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
                      title="Afficher/Masquer les filtres"
                    >
                      <i className="ri-filter-line mr-2"></i>
                      {showFilters ? 'Masquer' : 'Afficher'} Filtres
                    </button>
                    <button
                      onClick={() => {
                        if (tickets.length > 0) {
                          testAssignTechnician(tickets[0].id, 'Jean Martin (Test)');
                        }
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors cursor-pointer"
                      title="Test assignation"
                    >
                      <i className="ri-test-tube-line mr-2"></i>
                      Test Assignation
                    </button>
                    <button
                      onClick={reloadTickets}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors cursor-pointer"
                      title="Rafraîchir les données"
                    >
                      <i className="ri-refresh-line mr-2"></i>
                      Rafraîchir
                    </button>
                  </div>
                </div>

                {/* Section des filtres */}
                {showFilters && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center">
                        <i className="ri-filter-3-line mr-2 text-indigo-600"></i>
                        Filtres de recherche
                      </h4>
                      <button
                        onClick={reinitialiserFiltres}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <i className="ri-refresh-line mr-1"></i>
                        Réinitialiser
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Filtre par nom et prénom */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom et prénom
                        </label>
                        <input
                          type="text"
                          value={filtreNomPrenom}
                          onChange={(e) => setFiltreNomPrenom(e.target.value)}
                          placeholder="Rechercher par nom..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Filtre par statut */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={filtreStatut}
                          onChange={(e) => setFiltreStatut(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Tous les statuts</option>
                          {statutsUniques.map((statut) => (
                            <option key={statut} value={statut}>{statut}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filtre par date de début */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          value={dateDebut}
                          onChange={(e) => setDateDebut(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Filtre par date de fin */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Résumé des filtres actifs */}
                    {(filtreNomPrenom || filtreStatut || dateDebut || dateFin) && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-sm text-blue-800">
                          <strong>Filtres actifs :</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {filtreNomPrenom && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Nom: {filtreNomPrenom}
                              </span>
                            )}
                            {filtreStatut && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Statut: {filtreStatut}
                              </span>
                            )}
                            {dateDebut && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Depuis: {new Date(dateDebut).toLocaleDateString()}
                              </span>
                            )}
                            {dateFin && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Jusqu&apos;au: {new Date(dateFin).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistiques des résultats filtrés */}
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="font-medium">{ticketsFiltres.length}</span> incident(s) trouvé(s) 
                      {tickets.length !== ticketsFiltres.length && (
                        <span className="text-gray-500"> sur {tickets.length} au total</span>
                      )}
                    </div>
                  </div>
                )}

                <IncidentManagement
                  incidents={ticketsFiltres.filter(t => t.catégorie !== 'Demande de matériel')}
                  technicians={technicians}
                  onAssignIncident={handleAssignIncident}
                  onUpdateStatus={handleUpdateIncidentStatus}
                  onUpdateIncident={handleUpdateIncident}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <InventoryManagement
                inventory={inventory}
                onAddItem={handleAddInventoryItem}
                onUpdateItem={handleUpdateInventoryItem}
                techniciens={technicians}
                onAssignTechnician={(itemId: string, techName: string) => {
                  // Fonction pour assigner un technicien à un équipement
                  console.log(`Assigner ${techName} à l'équipement ${itemId}`);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de connexion */}
      {modalConnexion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Connexion Gestion Technique</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="votre.email@amd-international.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={motDePasseConnexion}
                  onChange={(e) => setMotDePasseConnexion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Mot de passe"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Compte de test disponible:</h4>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> admin@amd-international.com<br />
                  <strong>Mot de passe:</strong> admin123
                </p>
              </div>
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
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
  );
} 