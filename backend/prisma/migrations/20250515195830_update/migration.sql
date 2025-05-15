/*
  Warnings:

  - Made the column `images` on table `caterings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `designers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `photographers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `venues` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `caterings` MODIFY `images` JSON NOT NULL;

-- AlterTable
ALTER TABLE `designers` MODIFY `images` JSON NOT NULL;

-- AlterTable
ALTER TABLE `photographers` MODIFY `images` JSON NOT NULL;

-- AlterTable
ALTER TABLE `venues` MODIFY `images` JSON NOT NULL;
