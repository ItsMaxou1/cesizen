// Recette fonctionnelle automatisée de l'API CESIZen (bloc 2), fonctionnalité par fonctionnalité.
// Usage : API_URL=http://localhost:3001 ADMIN_EMAIL=... ADMIN_PASSWORD=... node recette-api.mjs
// Écrit resultats.json (utilisé pour remplir le PV de recette Excel).
import fs from 'node:fs';

const API = process.env.API_URL ?? 'http://localhost:3001';
const ADMIN = { email: process.env.ADMIN_EMAIL, mot_de_passe: process.env.ADMIN_PASSWORD };
const res = [];
let n = 0;

const call = async (method, path, body, token) => {
  const r = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch { /* corps vide */ }
  return { status: r.status, data };
};

const check = async (module, fonctionnalite, acteur, attendu, fn) => {
  n++;
  let ok = false, obs = '';
  try {
    const out = await fn();
    ok = out === true || (out && out.ok);
    obs = (out && out.obs) || '';
  } catch (e) {
    obs = 'Erreur : ' + e.message;
  }
  res.push({ id: `R-${String(n).padStart(2, '0')}`, module, fonctionnalite, acteur, attendu, resultat: ok ? 'Conforme' : 'Non conforme', observation: obs });
  console.log(`${ok ? 'OK ' : 'KO '} ${module} | ${fonctionnalite} | ${obs}`);
};

const stamp = Date.now();
const user = { email: `recette.${stamp}@cesizen.test`, mot_de_passe: 'Recette!2026', nom: 'Durand', prenom: 'Lea' };
let tokenUser, tokenAdmin, userId, catId, contenuId, exerciceId, autreId;

// ---------------- Module Comptes utilisateurs ----------------
const M1 = 'Comptes utilisateurs';
await check(M1, 'Création d\'un compte utilisateur', 'Visiteur anonyme', 'Inscription acceptée (201), compte créé avec le rôle USER', async () => {
  const r = await call('POST', '/api/auth/register', user);
  tokenUser = r.data?.token; userId = r.data?.user?.id;
  return { ok: r.status === 201 && r.data?.user?.role === 'USER', obs: `HTTP ${r.status}` };
});
await check(M1, 'Création d\'un compte : e-mail déjà utilisé', 'Visiteur anonyme', 'Refus d\'un second compte avec le même e-mail', async () => {
  const r = await call('POST', '/api/auth/register', user);
  return { ok: r.status >= 400 && r.status < 500, obs: `HTTP ${r.status} ${r.data?.message ?? ''}` };
});
await check(M1, 'Connexion', 'Utilisateur', 'Jeton JWT renvoyé avec de bons identifiants', async () => {
  const r = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: user.mot_de_passe });
  tokenUser = r.data?.token ?? tokenUser;
  return { ok: r.status === 200 && !!r.data?.token, obs: `HTTP ${r.status}` };
});
await check(M1, 'Connexion : mauvais mot de passe', 'Utilisateur', 'Connexion refusée (401)', async () => {
  const r = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: 'faux' });
  return { ok: r.status === 401, obs: `HTTP ${r.status}` };
});
await check(M1, 'Gestion du compte : consulter son profil', 'Utilisateur connecté', 'Profil renvoyé sans le mot de passe', async () => {
  const r = await call('GET', '/api/users/profil', null, tokenUser);
  return { ok: r.status === 200 && r.data?.email === user.email && !('mot_de_passe' in (r.data ?? {})), obs: `HTTP ${r.status}` };
});
await check(M1, 'Gestion du compte : modifier son profil', 'Utilisateur connecté', 'Nom et prénom modifiés', async () => {
  const r = await call('PUT', '/api/users/profil', { nom: 'Durand-Martin', prenom: 'Léa' }, tokenUser);
  const p = await call('GET', '/api/users/profil', null, tokenUser);
  return { ok: r.status === 200 && p.data?.nom === 'Durand-Martin', obs: `HTTP ${r.status}` };
});
await check(M1, 'Réinitialisation de son mot de passe', 'Utilisateur connecté', 'Nouveau mot de passe accepté à la connexion, ancien refusé', async () => {
  const r = await call('PUT', '/api/users/profil', { mot_de_passe: 'Nouveau!2026' }, tokenUser);
  const oldL = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: user.mot_de_passe });
  const newL = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: 'Nouveau!2026' });
  if (newL.data?.token) tokenUser = newL.data.token;
  return { ok: r.status === 200 && oldL.status === 401 && newL.status === 200, obs: `modif ${r.status}, ancien ${oldL.status}, nouveau ${newL.status} (changement depuis le profil connecté ; pas de « mot de passe oublié » par e-mail)` };
});
await check(M1, 'Accès administrateur refusé à un utilisateur', 'Utilisateur connecté', 'Liste des utilisateurs refusée (403)', async () => {
  const r = await call('GET', '/api/users', null, tokenUser);
  return { ok: r.status === 403, obs: `HTTP ${r.status}` };
});
await check(M1, 'Connexion administrateur', 'Administrateur', 'Jeton avec rôle ADMIN', async () => {
  const r = await call('POST', '/api/auth/login', ADMIN);
  tokenAdmin = r.data?.token;
  return { ok: r.status === 200 && r.data?.user?.role === 'ADMIN', obs: `HTTP ${r.status}` };
});
await check(M1, 'Gestion des comptes : lister les utilisateurs', 'Administrateur', 'Liste avec le nouvel utilisateur, sans mots de passe', async () => {
  const r = await call('GET', '/api/users', null, tokenAdmin);
  const found = Array.isArray(r.data) && r.data.some((u) => u.email === user.email);
  const noPwd = Array.isArray(r.data) && r.data.every((u) => !('mot_de_passe' in u));
  return { ok: r.status === 200 && found && noPwd, obs: `HTTP ${r.status}, ${Array.isArray(r.data) ? r.data.length : 0} comptes` };
});
await check(M1, 'Création d\'un compte administrateur', 'Administrateur', 'Nouvel administrateur créé (rôle ADMIN)', async () => {
  const r = await call('POST', '/api/users/create-admin', { email: `admin2.${stamp}@cesizen.test`, mot_de_passe: 'Admin2!2026', nom: 'Admin', prenom: 'Second' }, tokenAdmin);
  autreId = r.data?.id ?? r.data?.user?.id;
  return { ok: r.status === 201 || r.status === 200, obs: `HTTP ${r.status}` };
});
await check(M1, 'Désactivation d\'un compte utilisateur', 'Administrateur', 'Compte désactivé, connexion refusée', async () => {
  const r = await call('PATCH', `/api/users/${userId}/toggle`, null, tokenAdmin);
  const l = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: 'Nouveau!2026' });
  return { ok: r.status === 200 && l.status >= 400, obs: `toggle ${r.status}, connexion ${l.status}` };
});
await check(M1, 'Réactivation d\'un compte utilisateur', 'Administrateur', 'Compte réactivé, connexion de nouveau possible', async () => {
  const r = await call('PATCH', `/api/users/${userId}/toggle`, null, tokenAdmin);
  const l = await call('POST', '/api/auth/login', { email: user.email, mot_de_passe: 'Nouveau!2026' });
  if (l.data?.token) tokenUser = l.data.token;
  return { ok: r.status === 200 && l.status === 200, obs: `toggle ${r.status}, connexion ${l.status}` };
});

// ---------------- Module Informations ----------------
const M2 = 'Informations';
await check(M2, 'Créer une catégorie', 'Administrateur', 'Catégorie créée (201)', async () => {
  const r = await call('POST', '/api/categories', { nom: `Stress ${stamp}`, description: 'Comprendre le stress' }, tokenAdmin);
  catId = r.data?.id;
  return { ok: r.status === 201, obs: `HTTP ${r.status}` };
});
await check(M2, 'Modifier le contenu des pages d\'information (création)', 'Administrateur', 'Contenu créé (201)', async () => {
  const r = await call('POST', '/api/contenus', { titre: 'Qu\'est-ce que le stress ?', contenu: 'Le stress est une réaction normale…', categorieId: catId }, tokenAdmin);
  contenuId = r.data?.id;
  return { ok: r.status === 201, obs: `HTTP ${r.status}` };
});
await check(M2, 'Modifier le contenu des pages d\'information (modification)', 'Administrateur', 'Contenu modifié', async () => {
  const r = await call('PUT', `/api/contenus/${contenuId}`, { titre: 'Comprendre le stress', contenu: 'Texte mis à jour', categorieId: catId }, tokenAdmin);
  return { ok: r.status === 200 && r.data?.titre === 'Comprendre le stress', obs: `HTTP ${r.status}` };
});
await check(M2, 'Afficher les pages de contenus', 'Visiteur anonyme', 'Le contenu publié est visible sans connexion', async () => {
  const l = await call('GET', '/api/contenus');
  const d = await call('GET', `/api/contenus/${contenuId}`);
  return { ok: l.status === 200 && l.data.some((c) => c.id === contenuId) && d.status === 200, obs: `liste ${l.status}, détail ${d.status}` };
});
await check(M2, 'Modification interdite à un visiteur', 'Visiteur anonyme', 'Création de contenu refusée (401)', async () => {
  const r = await call('POST', '/api/contenus', { titre: 'x', contenu: 'x', categorieId: catId });
  return { ok: r.status === 401, obs: `HTTP ${r.status}` };
});
await check(M2, 'Commenter un contenu', 'Utilisateur connecté', 'Commentaire publié et visible', async () => {
  const r = await call('POST', '/api/commentaires', { contenu: 'Très utile, merci', contenuId }, tokenUser);
  const l = await call('GET', `/api/commentaires/contenu/${contenuId}`);
  return { ok: r.status === 201 && l.data?.length >= 1, obs: `HTTP ${r.status}` };
});
await check(M2, 'Aimer un contenu', 'Utilisateur connecté', 'Like enregistré', async () => {
  const r = await call('POST', '/api/likes/toggle', { contenuId }, tokenUser);
  const l = await call('GET', `/api/likes/contenu/${contenuId}`);
  return { ok: r.status < 300 && JSON.stringify(l.data).includes('1'), obs: `HTTP ${r.status}, compteur ${JSON.stringify(l.data)}` };
});
await check(M2, 'Désactiver un contenu', 'Administrateur', 'Contenu masqué de la liste publique', async () => {
  const r = await call('PATCH', `/api/contenus/${contenuId}/toggle`, null, tokenAdmin);
  const l = await call('GET', '/api/contenus');
  return { ok: r.status === 200 && !l.data.some((c) => c.id === contenuId), obs: `HTTP ${r.status}` };
});

// ---------------- Module Exercices de respiration ----------------
const M3 = 'Exercices de respiration';
await check(M3, 'Configurer l\'exercice de cohérence cardiaque (création)', 'Administrateur', 'Exercice 5-0-5 créé (inspiration / apnée / expiration)', async () => {
  const r = await call('POST', '/api/exercices', { titre: 'Cohérence cardiaque 5-5', description: '6 respirations par minute', duree_secondes: 300, inspiration: 5, apnee: 0, expiration: 5, categorieId: catId, type: 'bulle' }, tokenAdmin);
  exerciceId = r.data?.id;
  return { ok: r.status === 201 && r.data?.inspiration === 5, obs: `HTTP ${r.status}` };
});
await check(M3, 'Configurer l\'exercice (modification 7-4-8)', 'Administrateur', 'Rythme modifié', async () => {
  const r = await call('PUT', `/api/exercices/${exerciceId}`, { titre: 'Respiration 7-4-8', description: 'Apaisement', duree_secondes: 240, inspiration: 7, apnee: 4, expiration: 8, categorieId: catId, type: 'barre' }, tokenAdmin);
  return { ok: r.status === 200 && r.data?.apnee === 4 && r.data?.type === 'barre', obs: `HTTP ${r.status}` };
});
await check(M3, 'Consulter / lancer un exercice', 'Visiteur anonyme', 'Exercice et ses paramètres accessibles sans connexion', async () => {
  const r = await call('GET', `/api/exercices/${exerciceId}`);
  return { ok: r.status === 200 && r.data?.expiration === 8, obs: `HTTP ${r.status} (l'animation est côté mobile)` };
});
await check(M3, 'Ajouter un exercice en favori', 'Utilisateur connecté', 'Favori présent dans « mes favoris »', async () => {
  const r = await call('POST', '/api/favoris/toggle', { exerciceId }, tokenUser);
  const l = await call('GET', '/api/favoris/mes-favoris', null, tokenUser);
  return { ok: r.status < 300 && JSON.stringify(l.data).includes(`"exerciceId":${exerciceId}`), obs: `HTTP ${r.status}` };
});
await check(M3, 'Enregistrer un exercice réalisé (historique)', 'Utilisateur connecté', 'Exercice présent dans l\'historique', async () => {
  const r = await call('POST', '/api/historique', { exerciceId }, tokenUser);
  const l = await call('GET', '/api/historique/mon-historique', null, tokenUser);
  return { ok: r.status === 201 && l.data?.length >= 1, obs: `HTTP ${r.status}` };
});
await check(M3, 'Effacer son historique', 'Utilisateur connecté', 'Historique vidé', async () => {
  const r = await call('DELETE', '/api/historique/supprimer-tout', null, tokenUser);
  const l = await call('GET', '/api/historique/mon-historique', null, tokenUser);
  return { ok: r.status === 200 && l.data?.length === 0, obs: `HTTP ${r.status}` };
});
await check(M3, 'Désactiver un exercice', 'Administrateur', 'Exercice masqué de la liste publique', async () => {
  const r = await call('PATCH', `/api/exercices/${exerciceId}/toggle`, null, tokenAdmin);
  const l = await call('GET', '/api/exercices');
  return { ok: r.status === 200 && !l.data.some((e) => e.id === exerciceId), obs: `HTTP ${r.status}` };
});

// ---------------- Nettoyage : suppression du compte de test ----------------
await check(M1, 'Suppression d\'un compte utilisateur', 'Administrateur', 'Compte supprimé (et ses données liées)', async () => {
  const r = await call('DELETE', `/api/users/${userId}`, null, tokenAdmin);
  return { ok: r.status === 200, obs: `HTTP ${r.status} ${r.data?.message ?? ''}` };
});

fs.writeFileSync(new URL('./resultats.json', import.meta.url), JSON.stringify({ date: new Date().toISOString(), api: API, resultats: res }, null, 2));
const ko = res.filter((r) => r.resultat !== 'Conforme').length;
console.log(`\n${res.length - ko}/${res.length} conformes`);
if (ko > 0) process.exitCode = 1;
