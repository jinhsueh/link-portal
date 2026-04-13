-- AlterTable
ALTER TABLE "Block" ADD COLUMN "scheduleEnd" DATETIME;
ALTER TABLE "Block" ADD COLUMN "scheduleStart" DATETIME;

-- AlterTable
ALTER TABLE "Click" ADD COLUMN "referrer" TEXT;
ALTER TABLE "Click" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "Click" ADD COLUMN "utmSource" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN "password" TEXT;

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "memberEmail" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'active',
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    CONSTRAINT "TeamMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "blockId" TEXT,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'email_form',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscriber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "trialEndsAt" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "notifyNewSubscriber" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrder" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyReport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "id", "name", "updatedAt", "username") SELECT "avatarUrl", "bio", "createdAt", "email", "id", "name", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_ownerId_memberEmail_key" ON "TeamMember"("ownerId", "memberEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_userId_email_key" ON "Subscriber"("userId", "email");
