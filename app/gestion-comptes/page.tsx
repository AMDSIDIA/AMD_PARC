'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Utilisateur {
  nom: string;
  email: string;
  role: 'technicien' | 'administrateur' | 'chargé d\'acquisition';
  motDePasse: string;
}

interface NomUtilisateur {
  id: string;
  nom: string;
}

const GestionComptesPage = () => {
  // États pour l'authentification
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<Utilisateur | null>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [emailConnexion, setEmailConnexion] = useState('');
  const [motDePasseConnexion, setMotDePasseConnexion] = useState('');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [nomsUtilisateurs, setNomsUtilisateurs] = useState<NomUtilisateur[]>([]);
  const [nouvelUtilisateur, setNouvelUtilisateur] = useState({
    nom: '',
    email: '',
    role: 'technicien' as 'technicien' | 'administrateur' | 'chargé d\'acquisition',
    motDePasse: ''
  });
  const [nouveauNom, setNouveauNom] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

    // Charger les noms d'utilisateurs depuis le localStorage
    const nomsSauvegardes = localStorage.getItem('noms_utilisateurs_amd');
    if (nomsSauvegardes) {
      setNomsUtilisateurs(JSON.parse(nomsSauvegardes));
    } else {
      // Créer la liste par défaut des noms
      const nomsParDefaut: NomUtilisateur[] = [
        'BAGUIAN Moumouni', 'BAMOGO Moumini', 'BANDE Korka', 'BARRY Maimouna', 'BASSOLE Zafiirah',
        'COMPAORE D. Jonathan', 'COULIBALY Auguste', 'COULIBALY Ramatou', 'DAO Kadidiatou Leila',
        'DENE Hadiaratou', 'DENE Mohamed', 'GOUBA Dalidatou', 'GUIATIN Jonas', 'GUINDO Hawaw',
        'HOUNGNIZAN T. Marius', 'KABORE Abzeta', 'KABORE Lazarre', 'KABORE Moussa', 'KABORE Nouriatou',
        'KABORE W. Mohamed', 'KABORE W. Régis', 'KAFANDO T. Aline Flavie', 'KAGAMBEGA F. Salif',
        'KEBRE Abdoul Samade', 'KERE Ernest', 'KI Diane', 'KOUDA/BONKOUNGOU Madina', 'LOMPO Yemboido',
        'MANDOBIGA Oumpounini', 'MINOUNGOU A. Fatao', 'NABA Tiandjoa', 'NABALOUM Karim', 'NIKIEMA Saidou',
        'NOUKOUBRI Innocent', 'OUEDRAOGO Dramane', 'OUEDRAOGO Idrissa', 'OUEDRAOGO Isabelle',
        'OUEDRAOGO W. Aser', 'OUEDRAOGO/BONKOUNGOU Delphine', 'OUEDRAOGO/SORE Fatimata', 'OUOBA M. Victorien',
        'OUOBA Pascal', 'PODA Nata', 'SAMBIANI F. Judicael', 'SANOU Ezékiel', 'SAVADOGO Abdoulaziz',
        'SAWADOGO Harouna', 'SAWADOGO Salfo', 'SAWADOGO Sita Malick', 'SENI N. Augustin', 'SOUBEIGA Nicolas',
        'SOUBOU K. Robert'
      ].map((nom, index) => ({ id: `nom-${index}`, nom }));
      
      setNomsUtilisateurs(nomsParDefaut);
      localStorage.setItem('noms_utilisateurs_amd', JSON.stringify(nomsParDefaut));
    }
  }, []);

  // Charger l'utilisateur connecté depuis le localStorage
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('utilisateur_connecte_amd');
    if (utilisateurSauvegarde) {
      setUtilisateurConnecte(JSON.parse(utilisateurSauvegarde));
    }
  }, []);

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

  // Fonction pour ajouter un utilisateur (accès restreint)
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

  // Fonction pour supprimer un utilisateur (accès restreint)
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

  // Fonction pour ajouter un nom (accès restreint)
  const ajouterNom = () => {
    if (nouveauNom.trim()) {
      const nomExiste = nomsUtilisateurs.some(n => n.nom === nouveauNom.trim());
      if (nomExiste) {
        alert('Ce nom existe déjà dans la liste');
        return;
      }

      const nouveauNomUtilisateur: NomUtilisateur = {
        id: `nom-${Date.now()}`,
        nom: nouveauNom.trim()
      };

      const nouveauxNoms = [...nomsUtilisateurs, nouveauNomUtilisateur];
      setNomsUtilisateurs(nouveauxNoms);
      localStorage.setItem('noms_utilisateurs_amd', JSON.stringify(nouveauxNoms));
      setNouveauNom('');
      alert('Nom ajouté avec succès');
    }
  };

  // Fonction pour supprimer un nom (accès restreint)
  const supprimerNom = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce nom de la liste ?')) {
      const nouveauxNoms = nomsUtilisateurs.filter(n => n.id !== id);
      setNomsUtilisateurs(nouveauxNoms);
      localStorage.setItem('noms_utilisateurs_amd', JSON.stringify(nouveauxNoms));
    }
  };

  // Vérifier si l'utilisateur a accès à la gestion des comptes
  const aAccesGestionComptes = () => {
    return utilisateurConnecte && (
      utilisateurConnecte.role === 'administrateur' || 
      utilisateurConnecte.role === 'technicien' || 
      utilisateurConnecte.role === 'chargé d\'acquisition'
    );
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
              <Link href="/suivi-demandes" className="text-gray-600 hover:text-gray-900">Suivi des Demandes</Link>
              <Link href="/gestion-comptes" className="text-red-600 font-medium">Gestion des comptes</Link>

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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Comptes</h1>
              <p className="text-gray-600 mt-2">Gérez les utilisateurs et les accès au système</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-blue-600 font-medium">{utilisateurs.length} utilisateurs</span>
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
            <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à la gestion des comptes.</p>
            <button
              onClick={() => setModalConnexion(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
            >
              <i className="ri-login-box-line mr-2"></i>
              Se connecter
            </button>
          </div>
        ) : !aAccesGestionComptes() ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <i className="ri-shield-check-line text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès insuffisant</h3>
            <p className="text-gray-600">Seuls les administrateurs, techniciens et chargés d'acquisition peuvent accéder à la gestion des comptes.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ajouter un utilisateur */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ajouter un utilisateur</h2>
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
                    onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, role: e.target.value as 'technicien' | 'administrateur' | 'chargé d\'acquisition' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="technicien">Technicien</option>
                    <option value="administrateur">Administrateur</option>
                    <option value="chargé d'acquisition">Chargé d'acquisition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={nouvelUtilisateur.motDePasse}
                      onChange={(e) => setNouvelUtilisateur({ ...nouvelUtilisateur, motDePasse: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                      placeholder="Mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <i className="ri-eye-off-line"></i>
                      ) : (
                        <i className="ri-eye-line"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={ajouterUtilisateur}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <i className="ri-user-add-line mr-2"></i>
                  Ajouter l'utilisateur
                </button>
              </div>
            </div>

                         {/* Liste des utilisateurs */}
             <div className="bg-white rounded-lg shadow-sm p-6 border">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Utilisateurs existants</h2>
               <div className="space-y-3">
                 {utilisateurs.map((utilisateur, index) => (
                   <div key={utilisateur.email} className="flex items-center justify-between bg-gray-50 rounded-lg border p-4">
                     <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                         <i className="ri-user-line text-blue-600"></i>
                       </div>
                       <div>
                         <h4 className="font-medium text-gray-900">{utilisateur.nom}</h4>
                         <p className="text-sm text-gray-600">{utilisateur.email}</p>
                       </div>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         utilisateur.role === 'administrateur' 
                           ? 'bg-red-100 text-red-800' 
                           : utilisateur.role === 'chargé d\'acquisition'
                           ? 'bg-green-100 text-green-800'
                           : 'bg-blue-100 text-blue-800'
                       }`}>
                         {utilisateur.role}
                       </span>
                     </div>
                     {utilisateur.email !== 'admin@amd-international.com' && (
                       <button
                         onClick={() => supprimerUtilisateur(utilisateur.email)}
                         className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer"
                       >
                         <i className="ri-delete-bin-line mr-1"></i>
                         Supprimer
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             </div>

             {/* Gestion des noms d'utilisateurs */}
             <div className="bg-white rounded-lg shadow-sm p-6 border">
               <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des noms d'utilisateurs</h2>
               
               {/* Ajouter un nom */}
               <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                 <h3 className="text-lg font-medium text-gray-900 mb-3">Ajouter un nom</h3>
                 <div className="flex space-x-3">
                   <input
                     type="text"
                     value={nouveauNom}
                     onChange={(e) => setNouveauNom(e.target.value)}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                     placeholder="Entrez le nom et prénoms"
                   />
                   <button
                     onClick={ajouterNom}
                     className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                   >
                     <i className="ri-user-add-line mr-1"></i>
                     Ajouter
                   </button>
                 </div>
               </div>

               {/* Liste des noms */}
               <div className="space-y-2">
                 <h3 className="text-lg font-medium text-gray-900 mb-3">Noms disponibles ({nomsUtilisateurs.length})</h3>
                 <div className="max-h-60 overflow-y-auto space-y-2">
                   {nomsUtilisateurs.map((nomUtilisateur) => (
                     <div key={nomUtilisateur.id} className="flex items-center justify-between bg-gray-50 rounded-lg border p-3">
                       <span className="text-gray-900">{nomUtilisateur.nom}</span>
                       <button
                         onClick={() => supprimerNom(nomUtilisateur.id)}
                         className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors cursor-pointer text-sm"
                       >
                         <i className="ri-delete-bin-line mr-1"></i>
                         Supprimer
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

                         {/* Statistiques */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white rounded-lg shadow-sm p-6 border">
                 <div className="flex items-center">
                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                     <i className="ri-team-line text-blue-600 text-xl"></i>
                   </div>
                   <div className="ml-4">
                     <p className="text-sm text-gray-600">Total Utilisateurs</p>
                     <p className="text-2xl font-bold text-blue-600">{utilisateurs.length}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-lg shadow-sm p-6 border">
                 <div className="flex items-center">
                   <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                     <i className="ri-shield-user-line text-red-600 text-xl"></i>
                   </div>
                   <div className="ml-4">
                     <p className="text-sm text-gray-600">Administrateurs</p>
                     <p className="text-2xl font-bold text-red-600">{utilisateurs.filter(u => u.role === 'administrateur').length}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-lg shadow-sm p-6 border">
                 <div className="flex items-center">
                   <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                     <i className="ri-tools-line text-green-600 text-xl"></i>
                   </div>
                   <div className="ml-4">
                     <p className="text-sm text-gray-600">Techniciens</p>
                     <p className="text-2xl font-bold text-green-600">{utilisateurs.filter(u => u.role === 'technicien').length}</p>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-lg shadow-sm p-6 border">
                 <div className="flex items-center">
                   <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                     <i className="ri-user-line text-purple-600 text-xl"></i>
                   </div>
                   <div className="ml-4">
                     <p className="text-sm text-gray-600">Noms disponibles</p>
                     <p className="text-2xl font-bold text-purple-600">{nomsUtilisateurs.length}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

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
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <i className="ri-eye-off-line"></i>
                    ) : (
                      <i className="ri-eye-line"></i>
                    )}
                  </button>
                </div>
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
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={seConnecter}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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
};

export default GestionComptesPage;
