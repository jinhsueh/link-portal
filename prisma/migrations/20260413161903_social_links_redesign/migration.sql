/*
  Warnings:

  - A unique constraint covering the columns `[userId,url]` on the table `SocialLink` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SocialLink_userId_platform_key";

-- AlterTable
ALTER TABLE "SocialLink" ADD COLUMN "label" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_userId_url_key" ON "SocialLink"("userId", "url");
