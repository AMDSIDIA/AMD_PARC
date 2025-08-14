// Configuration centralisée de l'API
export const API_CONFIG = {
  // URL du backend déployé sur Render
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://amd-parc-backend.onrender.com',
  
  // Endpoints
  ENDPOINTS: {
    TICKETS: '/api/tickets',
    INCIDENTS: '/api/incidents',
    TECHNICIANS: '/api/technicians',
    INVENTORY: '/api/inventory',
    AUTH: '/api/auth/login',
    HEALTH: '/api/health'
  },
  
  // Configuration pour les requêtes
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
  }
};

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction utilitaire pour les requêtes fetch avec gestion d'erreur
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || `Erreur API: ${response.status}`;
      } catch {
        errorMessage = `Erreur API: ${response.status} - ${errorText}`;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la requête vers ${url}:`, error);
    throw error;
  }
};
