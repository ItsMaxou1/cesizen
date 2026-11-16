// URL de base de l'API.
// - En production/recette (conteneur Nginx), l'API est servie sur la même origine : '/api' suffit.
// - En développement local, on peut définir VITE_API_URL=http://localhost:3001 dans .env.local
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export const apiUrl = (path: string) => `${API_BASE}${path}`;
