-- First, add new columns with correct names
ALTER TABLE "waga_coffee_batches" ADD COLUMN "batchid" bigint;
ALTER TABLE "waga_coffee_batches" ADD COLUMN "producttype" varchar(20) DEFAULT 'RETAIL_BAGS';
ALTER TABLE "waga_coffee_batches" ADD COLUMN "unitweight" varchar(20);
ALTER TABLE "waga_coffee_batches" ADD COLUMN "lastverifiedtimestamp" bigint;
ALTER TABLE "waga_coffee_batches" ADD COLUMN "moisturecontent" numeric(5, 2);
ALTER TABLE "waga_coffee_batches" ADD COLUMN "defectcount" integer;
ALTER TABLE "waga_coffee_batches" ADD COLUMN "cooperativeid" varchar(42);
ALTER TABLE "waga_coffee_batches" ADD COLUMN "processorid" varchar(42);

-- Copy data from old columns to new columns (if old columns exist)
UPDATE "waga_coffee_batches" SET 
  "batchid" = "batch_id",
  "producttype" = COALESCE("productType", "product_type", 'RETAIL_BAGS'),
  "unitweight" = COALESCE("unitWeight", "unit_weight"),
  "lastverifiedtimestamp" = COALESCE("last_verified_timestamp"),
  "moisturecontent" = COALESCE("moistureContent", "moisture_content"),
  "defectcount" = COALESCE("defectCount", "defect_count"),
  "cooperativeid" = COALESCE("cooperativeId", "cooperative_id"),
  "processorid" = COALESCE("processorId", "processor_id");

-- Make batchid NOT NULL after data copy
ALTER TABLE "waga_coffee_batches" ALTER COLUMN "batchid" SET NOT NULL;
ALTER TABLE "waga_coffee_batches" ALTER COLUMN "producttype" SET NOT NULL;

-- Drop old constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'waga_coffee_batches_batch_id_unique') THEN
    ALTER TABLE "waga_coffee_batches" DROP CONSTRAINT "waga_coffee_batches_batch_id_unique";
  END IF;
END $$;

-- Drop old columns (only if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'batch_id') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "batch_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'productType') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "productType";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'product_type') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "product_type";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'unitWeight') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "unitWeight";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'unit_weight') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "unit_weight";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'last_verified_timestamp') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "last_verified_timestamp";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'moistureContent') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "moistureContent";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'moisture_content') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "moisture_content";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'defectCount') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "defectCount";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'defect_count') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "defect_count";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'cooperativeId') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "cooperativeId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'cooperative_id') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "cooperative_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'processorId') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "processorId";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waga_coffee_batches' AND column_name = 'processor_id') THEN
    ALTER TABLE "waga_coffee_batches" DROP COLUMN "processor_id";
  END IF;
END $$;

-- Add unique constraint
ALTER TABLE "waga_coffee_batches" ADD CONSTRAINT "waga_coffee_batches_batchid_unique" UNIQUE("batchid");