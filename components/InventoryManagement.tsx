'use client';

import { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  status: string;
  condition: string;
  assignedTo: string | null;
}

interface InventoryManagementProps {
  inventory: InventoryItem[];
  onAddItem: (item: any) => Promise<boolean>;
  techniciens?: { id: string; name: string }[];
  onAssignTechnician?: (itemId: string, techName: string) => void;
  onUpdateItem?: (itemId: string, updatedItem: Partial<InventoryItem>) => void;
}

export default function InventoryManagement({
  inventory,
  onAddItem,
  techniciens,
  onAssignTechnician,
  onUpdateItem
}: InventoryManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [nomsUtilisateurs, setNomsUtilisateurs] = useState<string[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    type: '',
    condition: ''
  });
  const [editItem, setEditItem] = useState({
    name: '',
    type: '',
    status: '',
    condition: '',
    assignedTo: ''
  });

  // Charger la liste des noms depuis localStorage
  useEffect(() => {
    const noms = localStorage.getItem('noms_utilisateurs_amd');
    if (noms) {
      try {
        const nomsArray = JSON.parse(noms);
        // S'assurer que nous avons des chaînes de caractères, pas des objets
        const nomsStrings = nomsArray.map((nom: any) => {
          if (typeof nom === 'string') {
            return nom;
          } else if (nom && typeof nom === 'object' && nom.nom) {
            return nom.nom;
          } else {
            return String(nom);
          }
        });
        setNomsUtilisateurs(nomsStrings);
      } catch (error) {
        console.error('Erreur lors du chargement des noms:', error);
        setNomsUtilisateurs([]);
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'En maintenance': return 'bg-red-100 text-red-800';
      case 'Hors service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Nouveau': return 'bg-green-100 text-green-800';
      case 'Bon': return 'bg-blue-100 text-blue-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Ancien': return 'bg-orange-100 text-orange-800';
      case 'Défectueux': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.type || !newItem.condition) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const success = await onAddItem(newItem);
      if (success) {
        setNewItem({ name: '', type: '', condition: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      alert(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditItem({
      name: item.name,
      type: item.type,
      status: item.status,
      condition: item.condition,
      assignedTo: item.assignedTo || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editItem.name || !editItem.type || !editItem.status || !editItem.condition) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (selectedItem && onUpdateItem) {
      try {
        onUpdateItem(selectedItem.id, {
          name: editItem.name,
          type: editItem.type,
          status: editItem.status,
          condition: editItem.condition,
          assignedTo: editItem.assignedTo || null
        });
        setShowEditForm(false);
        setSelectedItem(null);
        setEditItem({ name: '', type: '', status: '', condition: '', assignedTo: '' });
      } catch (error) {
        alert(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestion de l'Inventaire ({inventory.length})
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Ajouter un équipement
        </button>
      </div>

             {!inventory || !Array.isArray(inventory) || inventory.length === 0 ? (
         <div className="text-center py-8">
           <p className="text-gray-500">Aucun équipement dans l'inventaire</p>
         </div>
       ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisé par
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                         <tbody className="divide-y divide-gray-200">
               {inventory.filter(item => item && typeof item === 'object').map((item) => (
                 <tr key={item.id || Math.random()} className="hover:bg-gray-50">
                   <td className="px-4 py-3 text-sm font-medium text-gray-900">
                     {String(item.id || '')}
                   </td>
                   <td className="px-4 py-3 text-sm text-gray-900">
                     {String(item.name || '')}
                   </td>
                   <td className="px-4 py-3 text-sm text-gray-900">
                     {String(item.type || '')}
                   </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {/* Select pour assigner un utilisateur */}
                                         <select
                       value={item.assignedTo || ''}
                       onChange={e => onAssignTechnician && onAssignTechnician(item.id, e.target.value)}
                       className="px-2 py-1 border border-gray-300 rounded text-sm"
                     >
                       <option value="">-</option>
                       {Array.isArray(nomsUtilisateurs) && nomsUtilisateurs.map((nom, index) => (
                         <option key={index} value={String(nom)}>{String(nom)}</option>
                       ))}
                     </select>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajouter un équipement
              </h3>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'équipement
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un type</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État de l'équipement
                  </label>
                  <select
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un état</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Bon">Bon</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Ancien">Ancien</option>
                    <option value="Défectueux">Défectueux</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ name: '', type: '', condition: '' });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditForm && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier l'équipement
              </h3>
              
              <form onSubmit={handleUpdateItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'équipement
                  </label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement
                  </label>
                  <select
                    value={editItem.type}
                    onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un type</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut de l'équipement
                  </label>
                  <select
                    value={editItem.status}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un statut</option>
                    <option value="Disponible">Disponible</option>
                    <option value="En cours">En cours</option>
                    <option value="En maintenance">En maintenance</option>
                    <option value="Hors service">Hors service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État de l'équipement
                  </label>
                  <select
                    value={editItem.condition}
                    onChange={(e) => setEditItem({ ...editItem, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Sélectionner un état</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Bon">Bon</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Ancien">Ancien</option>
                    <option value="Défectueux">Défectueux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisé par
                  </label>
                                     <select
                     value={editItem.assignedTo}
                     onChange={(e) => setEditItem({ ...editItem, assignedTo: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   >
                     <option value="">-</option>
                     {Array.isArray(nomsUtilisateurs) && nomsUtilisateurs.map((nom, index) => (
                       <option key={index} value={String(nom)}>{String(nom)}</option>
                     ))}
                   </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedItem(null);
                      setEditItem({ name: '', type: '', status: '', condition: '', assignedTo: '' });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Mettre à jour
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