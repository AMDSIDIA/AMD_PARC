'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface DemandeMateriel {
  nomPrenoms: string;
  departement: string;
  poste: string;
  materielDemande: string;
  commentaire: string;
  telephone: string;
  quantite: number;
  date: string;
}

const DemandeMaterielPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<DemandeMateriel>({
    nomPrenoms: '',
    departement: '',
    poste: '',
    materielDemande: '',
    commentaire: '',
    telephone: '',
    quantite: 1,
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<keyof DemandeMateriel, string>>({} as Record<keyof DemandeMateriel, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autreNom, setAutreNom] = useState('');

  const departements = [
    'Direction Générale',
    'Direction Opérationnel',
    'SIDIA',
    'Département Administratif et RH',
    'Département Commercial',
    'Pôle Finance Publique',
    'Pôle Décentralisation et Développement Local',
    'Pôle Modélisation',
    'Pôle Nutrition',
    'Pôle Education',
    'Pole Enquête et Monitoring',
    'Pôle Climat',
    'Pôle Wash',
    'Pôle cohésion sociale',
    'Département Comptable et Finance'
  ];

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



  const validateForm = () => {
    const newErrors: Record<keyof DemandeMateriel, string> = {} as Record<keyof DemandeMateriel, string>;

    if (!formData.nomPrenoms.trim()) {
      newErrors.nomPrenoms = 'Le nom et prénoms sont requis';
    } else if (formData.nomPrenoms === 'Autre (à préciser)' && !autreNom.trim()) {
      newErrors.nomPrenoms = 'Veuillez préciser votre nom et prénoms';
    }
    if (!formData.departement) newErrors.departement = 'Le département est requis';
    if (!formData.poste.trim()) newErrors.poste = 'Le poste est requis';
    if (!formData.materielDemande) newErrors.materielDemande = 'Le matériel demandé est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le numéro de téléphone est requis';
    if (formData.quantite < 1) newErrors.quantite = 'La quantité doit être au moins de 1';
    if (!formData.date) newErrors.date = 'La date est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL = 'http://localhost:5000';
      
      // Créer un ticket de demande de matériel
      const nomFinal = formData.nomPrenoms === 'Autre (à préciser)' ? autreNom : formData.nomPrenoms;
      const ticketData = {
        nomPrenom: nomFinal,
        departement: formData.departement,
        poste: formData.poste,
        typeMatériel: formData.materielDemande,
        description: `Demande de matériel: ${formData.materielDemande}\nQuantité: ${formData.quantite}\nCommentaire: ${formData.commentaire}\nTéléphone: ${formData.telephone}\nDate de demande: ${formData.date}`,
        priorité: 'Moyenne',
        état: 'Nouveau',
        catégorie: 'Demande de matériel'
      };

      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        await response.json();
        alert('Votre demande de matériel a été enregistrée avec succès !');
        setFormData({
          nomPrenoms: '',
          departement: '',
          poste: '',
          materielDemande: '',
          commentaire: '',
          telephone: '',
          quantite: 1,
          date: new Date().toISOString().split('T')[0]
        });
        setAutreNom('');
        router.push('/suivi');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur serveur:', errorData);
        
        if (errorData.errors) {
          // Erreurs de validation
          const errorMessages = Object.values(errorData.errors).join('\n');
          alert(`Erreurs de validation:\n${errorMessages}`);
        } else if (errorData.message) {
          // Message d'erreur du serveur
          alert(`Erreur: ${errorData.message}`);
        } else {
          // Erreur générique
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error instanceof TypeError && (error as Error).message.includes('fetch')) {
        alert('Erreur de connexion au serveur. Veuillez vérifier que le backend est démarré sur http://localhost:5000');
      } else {
        alert(`Erreur lors de l'enregistrement de votre demande: ${(error as Error).message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DemandeMateriel, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (field === 'quantite') {
        updated[field] = typeof value === 'number' ? value : parseInt(value as string) || 1;
      } else {
        updated[field] = value as string;
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image 
                src="https://static.readdy.ai/image/1b1470ae2e6c51ef9abc425519678c59/ef4fe7e82dbc5a71c70987c5727051b9.png" 
                alt="AMD International Logo" 
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <span className="ml-4 text-lg font-semibold text-gray-800">
                AMD International - Demande de Matériel
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors cursor-pointer">
                Accueil
              </Link>
              <a href="/signaler" className="text-gray-700 hover:text-orange-600 font-medium transition-colors cursor-pointer">
                Signaler un problème
              </a>
              <a href="/suivi" className="text-gray-700 hover:text-orange-600 font-medium transition-colors cursor-pointer">
                Suivi des demandes
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-shopping-cart-line text-3xl text-orange-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Demande de Matériel
            </h1>
            <p className="text-gray-600">
              Formulaire de demande d&apos;acquisition de matériel informatique
            </p>
            <div className="mt-4 p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <i className="ri-information-line mr-2"></i>
                <strong>Important :</strong> Un seul matériel par demande. Pour plusieurs objets, veuillez faire des demandes distinctes.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-user-line mr-2 text-orange-600"></i>
                Informations Personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom et prénoms *
                  </label>
                  <select
                    value={formData.nomPrenoms}
                    onChange={(e) => handleInputChange('nomPrenoms', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.nomPrenoms ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez votre nom</option>
                    {nomsUtilisateurs.map(nom => (
                      <option key={nom} value={nom}>{nom}</option>
                    ))}
                  </select>
                  {errors.nomPrenoms && <p className="text-red-500 text-sm mt-1">{errors.nomPrenoms}</p>}
                  
                  {formData.nomPrenoms === 'Autre (à préciser)' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={autreNom}
                        onChange={(e) => setAutreNom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Précisez votre nom et prénoms"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département *
                  </label>
                  <select
                    value={formData.departement}
                    onChange={(e) => handleInputChange('departement', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.departement ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez votre département</option>
                    {departements.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.departement && <p className="text-red-500 text-sm mt-1">{errors.departement}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poste *
                  </label>
                  <input
                    type="text"
                    value={formData.poste}
                    onChange={(e) => handleInputChange('poste', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.poste ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre poste/fonction"
                  />
                  {errors.poste && <p className="text-red-500 text-sm mt-1">{errors.poste}</p>}
                </div>
              </div>
            </div>

            {/* Demande de matériel */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-computer-line mr-2 text-orange-600"></i>
                Matériel Demandé
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matériel demandé *
                  </label>
                  <input
                    type="text"
                    value={formData.materielDemande}
                    onChange={(e) => handleInputChange('materielDemande', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.materielDemande ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Ordinateur portable HP, Imprimante laser, etc."
                  />
                  {errors.materielDemande && <p className="text-red-500 text-sm mt-1">{errors.materielDemande}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantite}
                    onChange={(e) => handleInputChange('quantite', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.quantite ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantite && <p className="text-red-500 text-sm mt-1">{errors.quantite}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (détails sur votre demande)
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => handleInputChange('commentaire', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Précisez les détails, spécifications, urgence, etc."
                />
              </div>
            </div>

            {/* Contact et date */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i className="ri-phone-line mr-2 text-orange-600"></i>
                Contact et Date
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° Téléphone (WhatsApp si possible) *
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.telephone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre numéro de téléphone"
                  />
                  {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de demande *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandeMaterielPage; 