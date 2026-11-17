-- DropForeignKey
ALTER TABLE `Commentaire` DROP FOREIGN KEY `Commentaire_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Favori` DROP FOREIGN KEY `Favori_exerciceId_fkey`;

-- DropForeignKey
ALTER TABLE `Favori` DROP FOREIGN KEY `Favori_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoriqueExercice` DROP FOREIGN KEY `HistoriqueExercice_exerciceId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoriqueExercice` DROP FOREIGN KEY `HistoriqueExercice_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_utilisateurId_fkey`;

-- AlterTable
ALTER TABLE `ExerciceRespiration` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'bulle';

-- AddForeignKey
ALTER TABLE `Commentaire` ADD CONSTRAINT `Commentaire_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favori` ADD CONSTRAINT `Favori_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favori` ADD CONSTRAINT `Favori_exerciceId_fkey` FOREIGN KEY (`exerciceId`) REFERENCES `ExerciceRespiration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoriqueExercice` ADD CONSTRAINT `HistoriqueExercice_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoriqueExercice` ADD CONSTRAINT `HistoriqueExercice_exerciceId_fkey` FOREIGN KEY (`exerciceId`) REFERENCES `ExerciceRespiration`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
