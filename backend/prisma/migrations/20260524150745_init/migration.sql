-- Enable pg_trgm extension for GIN-indexed ILIKE substring search (CJK-safe)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "CharityTab" AS ENUM ('ORG', 'CAMPAIGN', 'MERCHANDISE');

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tab" "CharityTab" NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "logoUrl" TEXT,
    "amountRaised" INTEGER NOT NULL DEFAULT 0,
    "amountGoal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Charity_tab_createdAt_idx" ON "Charity"("tab", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Charity_categoryCode_idx" ON "Charity"("categoryCode");

-- GIN trigram indexes for ILIKE '%q%' substring search on CJK title + description
CREATE INDEX "charity_title_trgm_idx" ON "Charity" USING gin ("title" gin_trgm_ops);
CREATE INDEX "charity_description_trgm_idx" ON "Charity" USING gin ("description" gin_trgm_ops);
