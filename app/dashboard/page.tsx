'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LineChart, Line } from 'recharts';

function formatDateInput(date: Date) {
  return date.toISOString().split('T')[0];
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [dateDebut, setDateDebut] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return formatDateInput(d);
  });
  const [dateFin, setDateFin] = useState(() => formatDateInput(new Date()));

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

  // Filtrage par période
  const ticketsFiltres = tickets.filter(t => {
    const d = new Date(t.dateCreation);
    return d >= new Date(dateDebut) && d <= new Date(dateFin + 'T23:59:59');
  });

  // Statistiques globales
  const demandesMaterielEnCours = ticketsFiltres.filter(
    t => t.catégorie === 'Demande de matériel' && t.état !== 'Résolu' && t.état !== 'Clôturé'
  ).length;
  const assistTechNonBouclee = ticketsFiltres.filter(
    t => t.catégorie !== 'Demande de matériel' && t.état !== 'Résolu' && t.état !== 'Clôturé'
  ).length;
  const totalIncidents = ticketsFiltres.length;
  const ticketsResolus = ticketsFiltres.filter(t => t.état === 'Résolu' || t.état === 'Clôturé').length;

  // Statistiques pour le comparatif pipeline
  const ticketsEnCours = ticketsFiltres.filter(t => t.état === 'Assigné' || t.état === 'En cours').length;
  const ticketsEnAttente = ticketsFiltres.filter(t => t.état === 'En attente de pièce').length;

  // Fonction pour obtenir les statistiques par catégorie
  const obtenirStatistiquesCategorie = (categorie: string) => {
    const ticketsCategorie = ticketsFiltres.filter(t => t.catégorie === categorie);

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

  // Statistiques par service (département)
  const demandesParService: Record<string, number> = {};
  const demandesParPersonne: Record<string, number> = {};
  const evolutionParDate: Record<string, number> = {};
  ticketsFiltres.forEach(t => {
    if (t.catégorie === 'Demande de matériel') {
      // Par service
      if (t.departement) {
        demandesParService[t.departement] = (demandesParService[t.departement] || 0) + 1;
      }
      // Par personne
      if (t.nomPrenom) {
        demandesParPersonne[t.nomPrenom] = (demandesParPersonne[t.nomPrenom] || 0) + 1;
      }
      // Par date (évolution)
      const d = new Date(t.dateCreation);
      const key = d.toISOString().split('T')[0];
      evolutionParDate[key] = (evolutionParDate[key] || 0) + 1;
    }
  });
  const dataService = Object.entries(demandesParService).map(([service, count]) => ({ service, count }));
  const dataPersonne = Object.entries(demandesParPersonne).map(([personne, count]) => ({ personne, count }));
  const dataEvolution = Object.entries(evolutionParDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                AMD International - Tableau de bord
              </span>
            </div>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-indigo-600 font-medium cursor-pointer">Tableau de bord</Link>
              <Link href="/signaler" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">Signaler un problème</Link>
              <Link href="/demande-materiel" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">Demande de matériel</Link>
              <Link href="/suivi" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">Suivi des demandes</Link>
              <Link href="/gestion" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer">Gestion technique</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tableau de bord</h1>
              <p className="text-gray-600">Vue d&apos;ensemble des statistiques du parc informatique</p>
            </div>
            {/* Filtres de date */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border rounded px-3 py-2" />
              </div>
            </div>
            {/* Statistiques sous forme de tableau */}
            <div className="overflow-x-auto mb-12">
              <table className="min-w-full bg-white border rounded-lg shadow">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistique</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-4 font-medium">Demandes de matériel en cours</td>
                    <td className="px-6 py-4 text-orange-600 font-bold">{loadingTickets ? '...' : demandesMaterielEnCours}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Assistances techniques non bouclées</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{loadingTickets ? '...' : assistTechNonBouclee}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Tickets/incidents totaux</td>
                    <td className="px-6 py-4 text-indigo-600 font-bold">{loadingTickets ? '...' : totalIncidents}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Tickets résolus sur la période</td>
                    <td className="px-6 py-4 text-green-600 font-bold">{loadingTickets ? '...' : ticketsResolus}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Temps de résolution moyen</td>
                    <td className="px-6 py-4 text-green-600 font-bold">2.4h</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Taux de satisfaction</td>
                    <td className="px-6 py-4 text-blue-600 font-bold">98%</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Support disponible</td>
                    <td className="px-6 py-4 text-purple-600 font-bold">24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Monitoring visuel moderne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* BarChart par service */}
              <div className="bg-white rounded-lg shadow-sm p-6 border flex flex-col items-center">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Demandes de matériel par service</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataService} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" type="category" interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6366f1" name="Demandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* BarChart par personne */}
              <div className="bg-white rounded-lg shadow-sm p-6 border flex flex-col items-center">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Demandes de matériel par personne</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataPersonne} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="personne" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#f59e42" name="Demandes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* LineChart évolution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border mb-8 flex flex-col items-center">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Évolution des demandes de matériel</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dataEvolution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10b981" name="Demandes" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Graphique comparatif global */}
            <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Comparatif Tickets (Soumis / Résolus / En cours / En attente)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    {
                      name: 'Tickets',
                      "Total soumis": totalIncidents,
                      "Résolus": ticketsResolus,
                      "En cours": ticketsEnCours,
                      "En attente": ticketsEnAttente
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
                  <Bar dataKey="En cours" fill="#f59e42" />
                  <Bar dataKey="En attente" fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
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
          </div>
        </div>
      </main>
    </div>
  );
} 