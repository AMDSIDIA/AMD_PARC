
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://amd-parc-backend.onrender.com'}/api/tickets`);
        if (!response.ok) throw new Error('Erreur de chargement des tickets');
        const data = await response.json();
        setTickets(data);
      } catch {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                AMD International - Parc Informatique
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-indigo-600 font-medium transition-colors cursor-pointer">Tableau de bord</Link>
              <Link href="/signaler" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Signaler un problème
              </Link>
              <Link href="/demande-materiel" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">
                Demande de matériel
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

      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20corporate%20office%20environment%20with%20computers%20and%20IT%20equipment%2C%20professional%20tech%20support%20workspace%2C%20clean%20minimalist%20design%20with%20blue%20and%20white%20color%20scheme%2C%20soft%20lighting%20creating%20a%20productive%20atmosphere%2C%20high-tech%20computer%20screens%20and%20servers%20in%20background%2C%20professional%20business%20setting&width=1200&height=600&seq=hero-it-support&orientation=landscape')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-indigo-900/60"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Support Technique Centralisé
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
            Plateforme dédiée pour signaler, suivre et résoudre efficacement tous vos incidents informatiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signaler" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
              🚨 Signaler un incident
            </Link>
            <Link href="/demande-materiel" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
              📦 Demande de matériel
            </Link>
            <Link href="/suivi" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
              🚨 Suivi des incidents
            </Link>
            <Link href="/suivi-demandes" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
              📋 Suivi des demandes
            </Link>
            <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap">
              📊 Tableau de bord
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Services Disponibles
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Signaler un Problème
              </h4>
              <p className="text-gray-600 mb-6">
                Déclarez rapidement vos incidents techniques avec un formulaire simplifié et un système de priorités.
              </p>
              <Link href="/signaler" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
                Créer un ticket
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-shopping-cart-line text-2xl text-orange-600"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Demande de Matériel
              </h4>
              <p className="text-gray-600 mb-6">
                Formulez vos demandes d&apos;acquisition de matériel informatique avec un formulaire dédié.
              </p>
              <Link href="/demande-materiel" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
                Faire une demande
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-search-line text-2xl text-blue-600"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Suivi des Demandes
              </h4>
              <p className="text-gray-600 mb-6">
                Consultez l&apos;état d&apos;avancement de vos tickets et recevez des mises à jour en temps réel.
              </p>
              <Link href="/suivi" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
                Voir mes tickets
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <i className="ri-tools-line text-2xl text-green-600"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Gestion Technique
              </h4>
              <p className="text-gray-600 mb-6">
                Interface dédiée aux techniciens pour gérer, traiter et résoudre les incidents efficacement.
              </p>
              <Link href="/gestion" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap">
                Accès technicien
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {loadingTickets ? '...' : demandesMaterielEnCours}
              </div>
              <div className="text-gray-600">Demandes de matériel en cours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {loadingTickets ? '...' : assistTechNonBouclee}
              </div>
              <div className="text-gray-600">Assistances techniques en cours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">342</div>
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
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Actions Rapides
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Problèmes Fréquents</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <i className="ri-wifi-line text-blue-600 mr-3"></i>
                  Problème de connexion réseau
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="ri-computer-line text-blue-600 mr-3"></i>
                  Dysfonctionnement matériel
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="ri-lock-line text-blue-600 mr-3"></i>
                  Problème d&apos;accès/mot de passe
                </li>
                <li className="flex items-center text-gray-700">
                  <i className="ri-bug-line text-blue-600 mr-3"></i>
                  Bug logiciel
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Contact Support</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <i className="ri-phone-line text-green-600 mr-3"></i>
                  <span><strong>Signaler un incident :</strong> +226 65494389</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <i className="ri-phone-line text-orange-600 mr-3"></i>
                  <span><strong>Demande de matériel :</strong> +226 65186681</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <i className="ri-mail-line text-blue-600 mr-3"></i>
                  <span>pascalouoba5@gmail.com</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <i className="ri-time-line text-purple-600 mr-3"></i>
                  <span>Lun-Ven: 8h-18h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 AMD International - Parc Informatique. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
