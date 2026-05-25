-- Convert categoryCode (String) -> categoryCodes (String[]); add GIN index.

ALTER TABLE "Charity" ADD COLUMN "categoryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;

-- Backfill existing rows: wrap singular categoryCode into array
UPDATE "Charity" SET "categoryCodes" = ARRAY["categoryCode"];

-- Drop old single-value column + its btree index
DROP INDEX IF EXISTS "Charity_categoryCode_idx";
ALTER TABLE "Charity" DROP COLUMN "categoryCode";

-- New GIN index for array containment / @> / && / any-of queries
CREATE INDEX "Charity_categoryCodes_idx" ON "Charity" USING GIN ("categoryCodes");
