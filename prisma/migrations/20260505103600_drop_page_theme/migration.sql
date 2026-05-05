-- DropPageTheme
--
-- Page.theme was deprecated by 20260505034424_add_user_theme (theme moved
-- to User.theme so all pages share one visual identity). This migration
-- removes the now-unused column.
--
-- SQLite has no native DROP COLUMN before 3.35 / Turso. Standard Prisma
-- redefine-table pattern: PRAGMA off → CREATE new_Page → INSERT SELECT
-- (no theme) → DROP old → RENAME → recreate index → PRAGMA on.
--
-- IMPORTANT: ALL statements in this file MUST execute on the same SQLite
-- connection. PRAGMA settings are per-connection — if foreign_keys=OFF
-- doesn't persist across statements, DROP TABLE "Page" cascades into Block
-- (Block.pageId references Page with ON DELETE CASCADE) and wipes every
-- block in production. This is exactly what happened on the User.theme
-- migration before scripts/migrate-turso.ts was fixed to batch the whole
-- migration into a single Turso pipeline call.

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("createdAt", "id", "isDefault", "name", "order", "password", "slug", "updatedAt", "userId") SELECT "createdAt", "id", "isDefault", "name", "order", "password", "slug", "updatedAt", "userId" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_userId_slug_key" ON "Page"("userId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
