/*
  Warnings:

  - You are about to drop the `catering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `designer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inquiry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `photographer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userprofile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `viewhistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `catering` DROP FOREIGN KEY `Catering_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `designer` DROP FOREIGN KEY `Designer_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_cateringId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_designerId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_photographerId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_userId_fkey`;

-- DropForeignKey
ALTER TABLE `favorite` DROP FOREIGN KEY `Favorite_venueId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiry` DROP FOREIGN KEY `Inquiry_cateringId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiry` DROP FOREIGN KEY `Inquiry_designerId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiry` DROP FOREIGN KEY `Inquiry_photographerId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiry` DROP FOREIGN KEY `Inquiry_userId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiry` DROP FOREIGN KEY `Inquiry_venueId_fkey`;

-- DropForeignKey
ALTER TABLE `photographer` DROP FOREIGN KEY `Photographer_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `userprofile` DROP FOREIGN KEY `UserProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `venue` DROP FOREIGN KEY `Venue_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_cateringId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_designerId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_photographerId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `viewhistory` DROP FOREIGN KEY `ViewHistory_venueId_fkey`;

-- DropTable
DROP TABLE `catering`;

-- DropTable
DROP TABLE `designer`;

-- DropTable
DROP TABLE `favorite`;

-- DropTable
DROP TABLE `inquiry`;

-- DropTable
DROP TABLE `photographer`;

-- DropTable
DROP TABLE `user`;

-- DropTable
DROP TABLE `userprofile`;

-- DropTable
DROP TABLE `venue`;

-- DropTable
DROP TABLE `viewhistory`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('USER', 'PROVIDER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `preferences` JSON NULL,
    `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    `notifyPhone` BOOLEAN NOT NULL DEFAULT false,
    `avatar` VARCHAR(191) NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venues` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `amenities` JSON NULL,
    `images` TEXT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caterings` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `maxPeople` INTEGER NOT NULL,
    `pricePerPerson` DOUBLE NOT NULL,
    `cuisineType` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `dietaryOptions` JSON NULL,
    `images` TEXT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `photographers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `style` VARCHAR(191) NOT NULL,
    `experienceYears` INTEGER NOT NULL,
    `priceRange` VARCHAR(191) NOT NULL,
    `copyType` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `portfolio` TEXT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `designers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `style` VARCHAR(191) NOT NULL,
    `priceRange` VARCHAR(191) NOT NULL,
    `preferredVenues` VARCHAR(191) NULL,
    `eventTypes` VARCHAR(191) NULL,
    `portfolio` TEXT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `view_history` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NULL,
    `cateringId` VARCHAR(191) NULL,
    `photographerId` VARCHAR(191) NULL,
    `designerId` VARCHAR(191) NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venues` ADD CONSTRAINT `venues_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caterings` ADD CONSTRAINT `caterings_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `photographers` ADD CONSTRAINT `photographers_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `designers` ADD CONSTRAINT `designers_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `venues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_cateringId_fkey` FOREIGN KEY (`cateringId`) REFERENCES `caterings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_photographerId_fkey` FOREIGN KEY (`photographerId`) REFERENCES `photographers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `view_history` ADD CONSTRAINT `view_history_designerId_fkey` FOREIGN KEY (`designerId`) REFERENCES `designers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
