-- AlterTable
ALTER TABLE `users` ADD COLUMN `providerStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL,
    ADD COLUMN `verificationDoc` VARCHAR(191) NULL;
