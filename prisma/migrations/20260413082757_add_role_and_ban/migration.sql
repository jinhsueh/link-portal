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
    "role" TEXT NOT NULL DEFAULT 'user',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "trialEndsAt" DATETIME,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "bannedReason" TEXT,
    "notifyNewSubscriber" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrder" BOOLEAN NOT NULL DEFAULT true,
    "notifyWeeklyReport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "id", "name", "notifyNewOrder", "notifyNewSubscriber", "notifyWeeklyReport", "passwordHash", "plan", "stripeCustomerId", "stripeSubId", "trialEndsAt", "updatedAt", "username") SELECT "avatarUrl", "bio", "createdAt", "email", "id", "name", "notifyNewOrder", "notifyNewSubscriber", "notifyWeeklyReport", "passwordHash", "plan", "stripeCustomerId", "stripeSubId", "trialEndsAt", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
