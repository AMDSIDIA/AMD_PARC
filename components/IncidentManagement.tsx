'use client';

import { useState } from 'react';

interface Incident {
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
}

interface Technician {
  id: string;
  name: string;
}

interface IncidentManagementProps {
  incidents: Incident[];
  technicians: Technician[];
  onAssignIncident: (ticketId: string, technicianId: string) => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onUpdateIncident?: (ticketId: string, updatedIncident: Partial<Incident>) => void;
}

export default function IncidentManagement({
  incidents,
  technicians,
  onAssignIncident,
  onUpdateStatus,
  onUpdateIncident
}: IncidentManagementProps) {
  console.log('IncidentManagement - incidents reçus:', incidents); // Debug
  console.log('IncidentManagement - technicians reçus:', technicians); // Debug
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIncident, setEditIncident] = useState<Partial<Incident>>({});

  const getPriorityColor = (priorité: string) => {
    switch (priorité) {
      case 'Urgente': return 'bg-red-100 text-red-800';
      case 'Haute': return 'bg-orange-100 text-orange-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (état: string) => {
    switch (état) {
      case 'Nouveau': return 'bg-blue-100 text-blue-800';
      case 'Assigné': return 'bg-purple-100 text-purple-800';
      case 'En cours': return 'bg-amber-100 text-amber-800';
      case 'En attente de pièce': return 'bg-orange-100 text-orange-800';
      case 'Résolu': return 'bg-green-100 text-green-800';
      case 'Clôturé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssign = () => {
    if (selectedIncident && selectedTechnician) {
      console.log('Tentative d\'assignation:', { 
        incidentId: selectedIncident.id, 
        selectedTechnicianId: selectedTechnician,
        techniciensDisponibles: technicians 
      }); // Debug
      
      const technicien = technicians.find(t => t.id === selectedTechnician);
      console.log('Technicien trouvé dans handleAssign:', technicien); // Debug
      
      if (technicien) {
        console.log('Assignation:', { incidentId: selectedIncident.id, technicien: technicien.name }); // Debug
        onAssignIncident(selectedIncident.id, selectedTechnician);
        setSelectedIncident(null);
        setSelectedTechnician('');
      } else {
        console.error('Technicien non trouvé pour l\'ID:', selectedTechnician); // Debug
        alert('Erreur: Technicien non trouvé');
      }
    }
  };

  const handleUpdateStatus = () => {
    if (selectedIncident && selectedStatus) {
      console.log('Mise à jour statut:', { incidentId: selectedIncident.id, nouveauStatut: selectedStatus }); // Debug
      onUpdateStatus(selectedIncident.id, selectedStatus);
      setSelectedIncident(null);
      setSelectedStatus('');
    }
  };

  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setEditIncident({
      nomPrenom: incident.nomPrenom,
      departement: incident.departement,
      poste: incident.poste,
      typeMatériel: incident.typeMatériel,
      description: incident.description,
      priorité: incident.priorité,
      état: incident.état,
      technicienAssigné: incident.technicienAssigné
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIncident || !onUpdateIncident) {
      alert('Erreur: Impossible de modifier l\'incident');
      return;
    }

    try {
      // Validation des champs obligatoires
      if (!editIncident.nomPrenom || !editIncident.departement || !editIncident.description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      await onUpdateIncident(selectedIncident.id, editIncident);
      setShowEditModal(false);
      setSelectedIncident(null);
      setEditIncident({});
      alert('Incident modifié avec succès !');
    } catch (error) {
      alert(`Erreur lors de la modification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestion des Incidents ({incidents.length})
        </h2>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun incident à traiter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technicien
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incidents.map((incident) => {
                console.log('Rendu incident:', incident); // Debug
                return (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {incident.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {incident.nomPrenom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {incident.departement}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {incident.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(incident.priorité)}`}>
                        {incident.priorité}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.état)}`}>
                        {incident.état}
                      </span>
                    </td>
                                       <td className="px-4 py-3 text-sm text-gray-900">
                     {incident.technicienAssigné ? incident.technicienAssigné : '-'}
                     {/* Debug: afficher l'ID du ticket pour vérification */}
                     <div className="text-xs text-gray-400">ID: {incident.id}</div>
                   </td>
                                         <td className="px-4 py-3 text-sm font-medium space-x-2">
                       <button
                         onClick={() => handleEditIncident(incident)}
                         className="text-indigo-600 hover:text-indigo-900"
                         title="Modifier l'incident"
                       >
                         Modifier
                       </button>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de gestion */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gérer l'incident {selectedIncident.id}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigner un technicien
                  </label>
                  <select
                    value={selectedTechnician}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un technicien</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedTechnician}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Assigner
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mettre à jour le statut
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un statut</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Assigné">Assigné</option>
                    <option value="En cours">En cours</option>
                    <option value="En attente de pièce">En attente de pièce</option>
                    <option value="Résolu">Résolu</option>
                    <option value="Clôturé">Clôturé</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={!selectedStatus}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setSelectedTechnician('');
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'incident */}
      {showEditModal && selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier l'incident {selectedIncident.id}
              </h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom et prénoms *
                  </label>
                  <input
                    type="text"
                    value={editIncident.nomPrenom || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, nomPrenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département *
                  </label>
                  <select
                    value={editIncident.departement || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, departement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un département</option>
                    <option value="Direction Générale">Direction Générale</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Finances">Finances</option>
                    <option value="Opérations">Opérations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Technologie">Technologie</option>
                    <option value="Pôle cohésion sociale">Pôle cohésion sociale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    value={editIncident.poste || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, poste: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de matériel
                  </label>
                  <input
                    type="text"
                    value={editIncident.typeMatériel || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, typeMatériel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du problème *
                  </label>
                  <textarea
                    value={editIncident.description || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={editIncident.priorité || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, priorité: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner une priorité</option>
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={editIncident.état || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, état: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un statut</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Assigné">Assigné</option>
                    <option value="En cours">En cours</option>
                    <option value="En attente de pièce">En attente de pièce</option>
                    <option value="Résolu">Résolu</option>
                    <option value="Clôturé">Clôturé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technicien assigné
                  </label>
                  <select
                    value={editIncident.technicienAssigné || ''}
                    onChange={(e) => setEditIncident({ ...editIncident, technicienAssigné: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedIncident(null);
                      setEditIncident({});
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 