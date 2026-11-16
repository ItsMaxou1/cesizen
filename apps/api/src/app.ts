// app.ts : on exporte l'app Express sans l'écoute du port
// Cela permet aux tests d'importer l'app sans démarrer le serveur
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categorieRoutes from './routes/categorie.routes';
import exerciceRoutes from './routes/exercice.routes';
import contenuRoutes from './routes/contenu.routes';
import commentaireRoutes from './routes/commentaire.routes';
import likeRoutes from './routes/like.routes';
import favoriRoutes from './routes/favori.routes';
import historiqueRoutes from './routes/historique.routes';

const app = express();

// --- Sécurité (Bloc 3 : plan de sécurisation) ---
// Derrière le reverse proxy Nginx : nécessaire pour que le rate limit voie la vraie IP
app.set('trust proxy', 1);

// En-têtes HTTP de sécurité (X-Content-Type-Options, HSTS, X-Frame-Options...)
app.use(helmet());

// CORS restreint aux origines autorisées (variable CORS_ORIGINS, séparées par des virgules)
// Sans variable (développement local), toutes les origines sont acceptées.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }) as any
);

// Limite la taille des corps JSON (protection contre les requêtes géantes)
app.use(express.json({ limit: '100kb' }));

// Limitation du nombre de requêtes (anti brute-force / anti-abus)
const isTest = process.env.NODE_ENV === 'test';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' },
  skip: () => isTest,
});
app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Point de santé utilisé par Docker et la supervision
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: process.env.APP_VERSION || 'dev' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/exercices', exerciceRoutes);
app.use('/api/contenus', contenuRoutes);
app.use('/api/commentaires', commentaireRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/favoris', favoriRoutes);
app.use('/api/historique', historiqueRoutes);

// Gestion centralisée des erreurs : on ne renvoie jamais la pile d'appels au client
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

export default app;
