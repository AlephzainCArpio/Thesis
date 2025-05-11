/*
  Warnings:

  - You are about to drop the column `notifyEmail` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `notifyPhone` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user_profiles` DROP COLUMN `notifyEmail`,
    DROP COLUMN `notifyPhone`,
    DROP COLUMN `preferences`;
