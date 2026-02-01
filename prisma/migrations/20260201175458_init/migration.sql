-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT,
    "industry" TEXT,
    "foundedYear" INTEGER,
    "employees" TEXT,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");
