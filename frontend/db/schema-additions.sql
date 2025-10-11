-- Additional tables needed for full integration plan compliance
-- These should be added to your existing schema.ts file

-- Seller Registration System (from integration plan requirement)
CREATE TABLE seller_registrations (
    id SERIAL PRIMARY KEY,
    seller_address VARCHAR(42) NOT NULL UNIQUE,
    
    -- Ethiopian Legal Entity Information
    business_license_number VARCHAR(100) NOT NULL,
    tax_identification_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_business_type VARCHAR(50) NOT NULL, -- 'cooperative', 'private_company', 'sole_proprietorship'
    
    -- Location Information
    region VARCHAR(100) NOT NULL, -- Ethiopian region
    zone VARCHAR(100),
    woreda VARCHAR(100),
    kebele VARCHAR(100),
    physical_address TEXT NOT NULL,
    gps_coordinates VARCHAR(50),
    
    -- Contact Information
    primary_contact_name VARCHAR(255) NOT NULL,
    primary_contact_phone VARCHAR(20) NOT NULL,
    primary_contact_email VARCHAR(255),
    secondary_contact_name VARCHAR(255),
    secondary_contact_phone VARCHAR(20),
    
    -- Agricultural Information
    farm_size_hectares DECIMAL(10, 2),
    annual_production_estimate INTEGER, -- kg per year
    coffee_varieties JSON, -- array of coffee varieties grown
    certification_types JSON, -- organic, fair trade, etc.
    processing_methods JSON, -- washed, natural, honey, etc.
    
    -- Banking Integration (from integration plan)
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_swift_code VARCHAR(20),
    mobile_money_provider VARCHAR(50),
    mobile_money_number VARCHAR(20),
    
    -- Compliance Status
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    kyc_completed_at TIMESTAMP,
    kyc_expires_at TIMESTAMP,
    compliance_level VARCHAR(20) NOT NULL DEFAULT 'basic', -- 'basic', 'enhanced', 'premium'
    
    -- EUDR Compliance (from integration plan)
    eudr_compliance_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'compliant', 'non_compliant'
    deforestation_risk_assessment VARCHAR(20), -- 'low', 'medium', 'high'
    forest_monitoring_consent BOOLEAN DEFAULT false,
    
    -- Registration Status
    registration_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'banned'
    registration_tier VARCHAR(20) NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
    
    -- Verification Documents (IPFS hashes)
    business_license_document VARCHAR(64),
    tax_certificate_document VARCHAR(64),
    identity_document VARCHAR(64),
    bank_statement_document VARCHAR(64),
    land_ownership_document VARCHAR(64),
    
    -- Processing Information
    registered_by VARCHAR(42), -- admin address who approved
    registered_at TIMESTAMP,
    last_updated_by VARCHAR(42),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ethiopian Compliance Tracking (from integration plan)
CREATE TABLE ethiopian_compliance_records (
    id SERIAL PRIMARY KEY,
    seller_address VARCHAR(42) NOT NULL,
    batch_id BIGINT, -- references blockchain batch ID, nullable for seller-level compliance
    
    -- Compliance Type
    compliance_type VARCHAR(50) NOT NULL, -- 'export_permit', 'quality_certificate', 'origin_certificate', 'eudr_due_diligence'
    
    -- Export Documentation
    export_permit_number VARCHAR(100),
    export_permit_issuer VARCHAR(255),
    export_permit_valid_from DATE,
    export_permit_valid_until DATE,
    
    -- Quality Certification
    quality_grade VARCHAR(20), -- ECX quality grades
    moisture_content DECIMAL(5, 2),
    defect_count INTEGER,
    cup_quality_score DECIMAL(4, 2),
    certification_body VARCHAR(255),
    
    -- Origin Verification
    origin_region VARCHAR(100),
    origin_zone VARCHAR(100),
    origin_woreda VARCHAR(100),
    farm_coordinates VARCHAR(50),
    altitude_range VARCHAR(50),
    
    -- EUDR Due Diligence
    deforestation_assessment_result VARCHAR(20), -- 'compliant', 'non_compliant', 'pending'
    forest_risk_score DECIMAL(3, 2), -- 0.00 to 1.00
    satellite_verification_date DATE,
    on_site_inspection_date DATE,
    
    -- Documentation (IPFS hashes)
    compliance_document_hash VARCHAR(64),
    supporting_documents JSON, -- array of IPFS hashes
    
    -- Verification Status
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
    verified_by VARCHAR(42), -- Ethiopian authority address
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Blockchain Integration
    compliance_proof_hash VARCHAR(64), -- ZK proof hash for compliance
    blockchain_transaction_hash VARCHAR(66),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Banking Integration Transactions (from integration plan)
CREATE TABLE banking_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Core Transaction Data
    seller_address VARCHAR(42) NOT NULL,
    batch_id BIGINT, -- references blockchain batch ID
    transaction_type VARCHAR(30) NOT NULL, -- 'payment', 'disbursement', 'fee', 'penalty'
    
    -- Financial Details
    amount_usd DECIMAL(20, 8) NOT NULL,
    amount_etb DECIMAL(20, 2), -- Ethiopian Birr equivalent
    exchange_rate DECIMAL(10, 6), -- USD to ETB rate at time of transaction
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    
    -- Payment Method
    payment_method VARCHAR(30) NOT NULL, -- 'bank_transfer', 'mobile_money', 'cash', 'cryptocurrency'
    bank_reference_number VARCHAR(100),
    mobile_money_reference VARCHAR(50),
    
    -- Transaction Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    initiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Banking Details
    sender_bank VARCHAR(255),
    sender_account VARCHAR(50),
    receiver_bank VARCHAR(255),
    receiver_account VARCHAR(50),
    
    -- Fee Structure
    transaction_fee_usd DECIMAL(10, 4) DEFAULT 0,
    network_fee_usd DECIMAL(10, 4) DEFAULT 0,
    processing_fee_usd DECIMAL(10, 4) DEFAULT 0,
    total_fees_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- Integration Data
    chainlink_request_id VARCHAR(255), -- if processed via Chainlink
    external_transaction_id VARCHAR(255), -- bank/mobile money provider ID
    
    -- Error Handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Compliance
    aml_check_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'cleared', 'flagged'
    kyc_verification_level VARCHAR(20), -- from seller registration
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enhanced ZK Proof Requirements (additional to existing zkProofs table)
-- Add these columns to existing zkProofs table or create supplementary table
CREATE TABLE zk_compliance_proofs (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL UNIQUE, -- references zkProofs.proof_id
    batch_id BIGINT NOT NULL,
    
    -- Compliance-Specific Proof Types
    compliance_category VARCHAR(50) NOT NULL, -- 'ethiopian_export', 'eudr_deforestation', 'quality_assurance', 'banking_compliance'
    
    -- Ethiopian Export Compliance
    export_permit_proof_hash VARCHAR(64),
    origin_verification_proof_hash VARCHAR(64),
    quality_grade_proof_hash VARCHAR(64),
    
    -- EUDR Compliance
    deforestation_proof_hash VARCHAR(64),
    forest_monitoring_proof_hash VARCHAR(64),
    satellite_data_proof_hash VARCHAR(64),
    
    -- Banking/Financial Compliance
    payment_authorization_proof_hash VARCHAR(64),
    aml_compliance_proof_hash VARCHAR(64),
    
    -- Proof Validity
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    regulatory_body VARCHAR(255), -- which authority accepts this proof
    
    -- Integration
    smart_contract_verification_tx VARCHAR(66),
    ipfs_metadata_hash VARCHAR(64),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- System Configuration for New Features
CREATE TABLE system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    
    -- Configuration Categories
    category VARCHAR(50) NOT NULL, -- 'blockchain', 'banking', 'compliance', 'zk_privacy', 'ui'
    subcategory VARCHAR(50),
    
    -- Access Control
    is_public BOOLEAN NOT NULL DEFAULT false,
    required_role VARCHAR(50), -- minimum role required to modify
    
    -- Validation
    validation_schema JSON, -- JSON schema for value validation
    default_value TEXT,
    
    -- Metadata
    description TEXT,
    last_modified_by VARCHAR(42),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Trail for All System Changes
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    
    -- Entity Information
    entity_type VARCHAR(50) NOT NULL, -- 'seller_registration', 'compliance_record', 'banking_transaction', etc.
    entity_id VARCHAR(100) NOT NULL, -- ID of the affected entity
    
    -- Change Information
    action VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
    changed_fields JSON, -- array of field names that changed
    old_values JSON, -- previous values (for updates)
    new_values JSON, -- new values
    
    -- User Information
    user_address VARCHAR(42) NOT NULL,
    user_role VARCHAR(50),
    user_ip_address INET,
    
    -- Context
    reason TEXT, -- why the change was made
    related_transaction_hash VARCHAR(66), -- if blockchain-related
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_seller_registrations_address ON seller_registrations(seller_address);
CREATE INDEX idx_seller_registrations_status ON seller_registrations(registration_status);
CREATE INDEX idx_ethiopian_compliance_seller ON ethiopian_compliance_records(seller_address);
CREATE INDEX idx_ethiopian_compliance_batch ON ethiopian_compliance_records(batch_id);
CREATE INDEX idx_banking_transactions_seller ON banking_transactions(seller_address);
CREATE INDEX idx_banking_transactions_status ON banking_transactions(status);
CREATE INDEX idx_zk_compliance_batch ON zk_compliance_proofs(batch_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_address);