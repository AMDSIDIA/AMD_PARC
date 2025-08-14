
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignalerProbleme() {
  const [formData, setFormData] = useState({
    nomPrenoms: '',
    departement: '',
    poste: '',
    descriptionProbleme: '',
    categorie: '',
    typeMatériel: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [autreNom, setAutreNom] = useState('');
  const [nomsUtilisateurs, setNomsUtilisateurs] = useState<string[]>([]);

  // Charger les noms d'utilisateurs depuis le localStorage
  useEffect(() => {
    const nomsSauvegardes = localStorage.getItem('noms_utilisateurs_amd');
    if (nomsSauvegardes) {
      const noms = JSON.parse(nomsSauvegardes);
      const nomsListe = noms.map((nom: any) => nom.nom);
      setNomsUtilisateurs([...nomsListe, 'Autre (à préciser)']);
    } else {
      // Liste par défaut si aucun nom n'est sauvegardé
      const nomsParDefaut = [
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
        'SOUBOU K. Robert', 'Autre (à préciser)'
      ];
      setNomsUtilisateurs(nomsParDefaut);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? target.files?.[0] : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.nomPrenoms.trim()) {
      setSubmitStatus('Veuillez sélectionner votre nom et prénoms.');
      setIsSubmitting(false);
      return;
    }

    if (formData.nomPrenoms === 'Autre (à préciser)' && !autreNom.trim()) {
      setSubmitStatus('Veuillez préciser votre nom et prénoms.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.departement.trim()) {
      setSubmitStatus('Veuillez sélectionner votre département.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.poste.trim()) {
      setSubmitStatus('Veuillez saisir votre poste.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.descriptionProbleme.trim()) {
      setSubmitStatus('Veuillez décrire le problème.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.categorie.trim()) {
      setSubmitStatus('Veuillez sélectionner une catégorie.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.typeMatériel.trim()) {
      setSubmitStatus('Veuillez spécifier le type de matériel concerné.');
      setIsSubmitting(false);
      return;
    }

    if (formData.descriptionProbleme.length > 500) {
      setSubmitStatus('La description ne peut pas dépasser 500 caractères.');
      setIsSubmitting(false);
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://amd-parc-backend.onrender.com';
      
      const nomFinal = formData.nomPrenoms === 'Autre (à préciser)' ? autreNom : formData.nomPrenoms;
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomPrenom: nomFinal,
          departement: formData.departement,
          poste: formData.poste,
          description: formData.descriptionProbleme,
          catégorie: formData.categorie,
          typeMatériel: formData.typeMatériel,
          priorité: 'Moyenne',
          état: 'Nouveau'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          // Erreurs de validation
          const errorMessages = Object.values(data.errors).join('\n');
          throw new Error(`Erreurs de validation:\n${errorMessages}`);
        } else if (data.message) {
          // Message d'erreur du serveur
          throw new Error(data.message);
        } else {
          // Erreur générique
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }

      setSubmitStatus(`Signalement réussi! Ticket: ${data.id || data.ticketId || 'Créé avec succès'}`);
      setFormData({
        nomPrenoms: '', departement: '', poste: '', descriptionProbleme: '', categorie: '', typeMatériel: ''
      });
      setAutreNom('');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitStatus('Erreur de connexion au serveur. Veuillez vérifier que le backend est accessible.');
      } else {
        setSubmitStatus(`Erreur lors de la soumission: ${error instanceof Error ? error.message : 'Erreur inconnue. Veuillez réessayer.'}`);
      }
    }

    setIsSubmitting(false);
  };

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
                AMD International - Parc Informatique
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/signaler" className="text-indigo-600 font-medium cursor-pointer">
                Signaler un problème
              </Link>
              <Link href="/suivi" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Suivi des incidents
              </Link>
              <Link href="/suivi-demandes" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Suivi des demandes
              </Link>
              <Link href="/gestion" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Gestion technique
              </Link>
              <Link href="/gestion-comptes" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Gestion des comptes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Signaler un Problème Technique
              </h1>
              <p className="text-gray-600">
                Remplissez ce formulaire pour créer un ticket de support technique
              </p>
            </div>

            <form id="incident-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Informations Personnelles */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom et prénoms <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="nomPrenoms"
                      value={formData.nomPrenoms}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    >
                      <option value="">Sélectionnez votre nom</option>
                      {nomsUtilisateurs.map(nom => (
                        <option key={nom} value={nom}>{nom}</option>
                      ))}
                    </select>
                    
                    {formData.nomPrenoms === 'Autre (à préciser)' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={autreNom}
                          onChange={(e) => setAutreNom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Précisez votre nom et prénoms"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Département <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="departement"
                        value={formData.departement}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                        required
                      >
                        <option value="">Sélectionner un département</option>
                        <option value="Direction Générale">Direction Générale</option>
                        <option value="Direction Opérationnel">Direction Opérationnel</option>
                        <option value="SIDIA">SIDIA</option>
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
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poste <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="poste"
                      value={formData.poste}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Ex: Analyste, Manager, Directeur..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="categorie"
                        value={formData.categorie}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
                        required
                      >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="Matériel">Matériel</option>
                        <option value="Logiciel">Logiciel</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <i className="ri-arrow-down-s-line text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de matériel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="typeMatériel"
                      value={formData.typeMatériel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="Ex: Ordinateur, Imprimante, Scanner..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description du problème */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description du problème</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du problème <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="descriptionProbleme"
                    value={formData.descriptionProbleme}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Décrivez en détail le problème rencontré..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.descriptionProbleme.length}/500 caractères
                  </p>
                </div>
              </div>

              {/* Submit Status */}
              {submitStatus && (
                <div className={`p-4 rounded-lg ${submitStatus.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {submitStatus}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Envoi en cours...
                    </div>
                  ) : (
                    'Créer le ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
