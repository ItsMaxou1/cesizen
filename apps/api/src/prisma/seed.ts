// seed.ts : crée (ou met à jour) le compte administrateur initial.
// Utilisé au premier déploiement et par les tests de bout en bout (CI).
// Les identifiants viennent des variables d'environnement : aucun mot de passe dans le code.
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

const main = async () => {
  const email = process.env.ADMIN_EMAIL;
  const motDePasse = process.env.ADMIN_PASSWORD;
  if (!email || !motDePasse) {
    console.error('ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires');
    process.exit(1);
  }
  const hash = await bcrypt.hash(motDePasse, 10);
  await prisma.utilisateur.upsert({
    where: { email },
    update: { mot_de_passe: hash, role: 'ADMIN', isActive: true },
    create: { email, mot_de_passe: hash, nom: 'Admin', prenom: 'CESIZen', role: 'ADMIN' },
  });
  console.log(`Administrateur prêt : ${email}`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
