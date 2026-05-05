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
    "bannerUrl" TEXT,
    "theme" TEXT NOT NULL DEFAULT '{}',
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
INSERT INTO "new_User" ("avatarUrl", "banned", "bannedAt", "bannedReason", "bannerUrl", "bio", "createdAt", "email", "id", "name", "notifyNewOrder", "notifyNewSubscriber", "notifyWeeklyReport", "passwordHash", "plan", "role", "stripeCustomerId", "stripeSubId", "trialEndsAt", "updatedAt", "username") SELECT "avatarUrl", "banned", "bannedAt", "bannedReason", "bannerUrl", "bio", "createdAt", "email", "id", "name", "notifyNewOrder", "notifyNewSubscriber", "notifyWeeklyReport", "passwordHash", "plan", "role", "stripeCustomerId", "stripeSubId", "trialEndsAt", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Backfill: theme is moving from Page to User. For each user, copy their
-- default page's theme (or first page's, if none flagged default) into the
-- new User.theme column so existing visuals are preserved across the
-- refactor. Page.theme is kept for now as a no-op safety net.
UPDATE "User" SET "theme" = COALESCE(
  (SELECT "theme" FROM "Page" WHERE "userId" = "User"."id" AND "isDefault" = 1 LIMIT 1),
  (SELECT "theme" FROM "Page" WHERE "userId" = "User"."id" ORDER BY "order" ASC LIMIT 1),
  '{}'
);
