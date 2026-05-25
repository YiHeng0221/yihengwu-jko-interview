-- AddPolymorphicFields
ALTER TABLE "Charity"
  ADD COLUMN "bannerImageUrl"  TEXT,
  ADD COLUMN "orgName"         TEXT,
  ADD COLUMN "tags"             TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "productImageUrl" TEXT,
  ADD COLUMN "priceNtd"        INTEGER;
