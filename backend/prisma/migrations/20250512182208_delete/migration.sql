-- AlterTable
ALTER TABLE `user_profiles` ADD COLUMN `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyPhone` BOOLEAN NOT NULL DEFAULT false;
