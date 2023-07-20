-- CreateTable
CREATE TABLE "Journal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "details" TEXT,
    "on_date" TEXT NOT NULL
);
