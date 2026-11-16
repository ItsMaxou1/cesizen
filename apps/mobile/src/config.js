// URL de l'API utilisée par l'application mobile.
// Définie au build par la variable EXPO_PUBLIC_API_URL (recette ou production),
// sinon adresse locale de développement.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
