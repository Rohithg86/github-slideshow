-- CreateTable
CREATE TABLE "BrokerAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "isin" TEXT,
    "quantity" REAL NOT NULL,
    "averagePrice" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EQUITY',
    "targetAllocation" REAL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Holding_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BrokerAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "symbol" TEXT,
    "quantity" REAL,
    "price" REAL,
    "fees" REAL DEFAULT 0,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BrokerAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "asOf" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "symbol" TEXT,
    "action" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "rationale" TEXT NOT NULL,
    "targetWeight" REAL
);

-- CreateIndex
CREATE UNIQUE INDEX "BrokerAccount_accountNumber_key" ON "BrokerAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "Holding_symbol_idx" ON "Holding"("symbol");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_accountNumber_key" ON "BankAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "BankTransaction_date_idx" ON "BankTransaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PriceCache_symbol_key" ON "PriceCache"("symbol");
