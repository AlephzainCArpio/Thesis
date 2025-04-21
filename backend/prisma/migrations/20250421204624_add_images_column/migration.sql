/*
  Warnings:

  - You are about to alter the column `images` on the `caterings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - You are about to alter the column `images` on the `venues` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `caterings` MODIFY `images` JSON NULL;

-- AlterTable
ALTER TABLE `designers` ADD COLUMN `images` JSON NULL;

-- AlterTable
ALTER TABLE `photographers` ADD COLUMN `images` JSON NULL;

-- AlterTable
ALTER TABLE `venues` MODIFY `images` JSON NULL;
