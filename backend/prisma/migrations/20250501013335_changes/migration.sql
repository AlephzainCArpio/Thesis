/*
  Warnings:

  - You are about to drop the column `preferredVenues` on the `designers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `designers` DROP COLUMN `preferredVenues`,
    ADD COLUMN `preferredEvent` VARCHAR(191) NULL;
