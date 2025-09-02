-- Migration: Product Line Expansion for Green Coffee Beans and Roasted Coffee Beans
-- This migration extends the database schema to support multiple coffee product types
-- while maintaining backward compatibility with existing retail coffee batches

-- Extend waga_coffee_batches table with product type support
ALTER TABLE waga_coffee_batches
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'RETAIL_BAGS' CHECK (product_type IN ('RETAIL_BAGS', 'GREEN_BEANS', 'ROASTED_BEANS')),
ADD COLUMN IF NOT EXISTS unit_weight VARCHAR(20),
ADD COLUMN IF NOT EXISTS moisture_content DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS density DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS defect_count INTEGER,
ADD COLUMN IF NOT EXISTS cooperative_id VARCHAR(42),
ADD COLUMN IF NOT EXISTS processor_id VARCHAR(42);

-- Update existing retail batches to have explicit product type
UPDATE waga_coffee_batches
SET product_type = 'RETAIL_BAGS'
WHERE product_type IS NULL;

-- Extend user_roles table for new user types
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS certification_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_waga_batches_product_type ON waga_coffee_batches(product_type);
CREATE INDEX IF NOT EXISTS idx_waga_batches_cooperative ON waga_coffee_batches(cooperative_id) WHERE cooperative_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waga_batches_processor ON waga_coffee_batches(processor_id) WHERE processor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_company ON user_roles(company_name) WHERE company_name IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN waga_coffee_batches.product_type IS 'Type of coffee product: RETAIL_BAGS (250g/500g ready-to-consume), GREEN_BEANS (60kg raw beans), ROASTED_BEANS (60kg roasted beans)';
COMMENT ON COLUMN waga_coffee_batches.unit_weight IS 'Weight specification for the product unit (e.g., 250g, 500g, 60kg)';
COMMENT ON COLUMN waga_coffee_batches.moisture_content IS 'Moisture content percentage (for green/roasted beans)';
COMMENT ON COLUMN waga_coffee_batches.density IS 'Bean density measurement (for green/roasted beans)';
COMMENT ON COLUMN waga_coffee_batches.defect_count IS 'Number of defective beans found (for green/roasted beans)';
COMMENT ON COLUMN waga_coffee_batches.cooperative_id IS 'Ethereum address of the cooperative that produced the green beans';
COMMENT ON COLUMN waga_coffee_batches.processor_id IS 'Ethereum address of the processor/roaster who handled the beans';

COMMENT ON COLUMN user_roles.company_name IS 'Company name for cooperatives and roasters';
COMMENT ON COLUMN user_roles.certification_level IS 'Certification level (Organic, Fair Trade, etc.)';
COMMENT ON COLUMN user_roles.specialization IS 'Coffee type or processing specialization';
