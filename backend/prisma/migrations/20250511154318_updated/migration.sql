/*
  Warnings:

  - Made the column `eventTypes` on table `designers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventTypes` on table `venues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `designers` MODIFY `eventTypes` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `user_profiles` ADD COLUMN `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyPhone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `preferences` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `venues` MODIFY `eventTypes` LONGTEXT NOT NULL;
