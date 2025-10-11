-- Migration Plan for WAGA Coffee Tokenization System
-- Target: Neon PostgreSQL via Netlify
-- Purpose: Add seller registration, Ethiopian compliance, and banking integration

-- ============================================================================
-- MIGRATION 001: Convert existing schema.ts to SQL
-- ============================================================================

-- Create enum types first
CREATE TYPE product_type AS ENUM ('RETAIL_BAGS', 'GREEN_BEANS', 'ROASTED_BEANS');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE registration_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE registration_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE compliance_level AS ENUM ('basic', 'enhanced', 'premium');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE privacy_level AS ENUM ('public', 'selective', 'private');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'approve', 'reject');

-- ============================================================================
-- MIGRATION 002: Core existing tables (from current schema.ts)
-- ============================================================================

-- Coffee Batches (main table)
CREATE TABLE waga_coffee_batches (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL UNIQUE,
    
    -- Core Batch Information
    production_date BIGINT NOT NULL,
    expiry_date BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    packaging_info VARCHAR(20) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    
    -- Verification Status
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_metadata_verified BOOLEAN NOT NULL DEFAULT false,
    last_verified_timestamp BIGINT DEFAULT 0,
    verification_transaction_hash VARCHAR(66),
    
    -- Product Classification
    product_type product_type NOT NULL DEFAULT 'RETAIL_BAGS',
    unit_weight VARCHAR(50),
    
    -- IPFS Integration
    metadata_uri VARCHAR(255),
    metadata_hash VARCHAR(64),
    ipfs_hash VARCHAR(64),
    
    -- Additional IPFS Metadata Fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    farmer VARCHAR(255),
    altitude VARCHAR(100),
    process VARCHAR(100),
    
    -- Product-Specific Fields
    roast_profile VARCHAR(100),
    roast_date VARCHAR(50),
    moisture_content DECIMAL(5, 2),
    density DECIMAL(5, 2),
    defect_count INTEGER,
    
    -- Common Fields
    certifications JSONB,
    cupping_notes JSONB,
    image VARCHAR(255),
    
    -- Cooperative/Processor Information
    cooperative_id VARCHAR(42),
    processor_id VARCHAR(42),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verification Requests
CREATE TABLE verification_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) NOT NULL UNIQUE,
    batch_id BIGINT NOT NULL,
    
    -- Request Details
    verification_type VARCHAR(20) NOT NULL DEFAULT 'reserve',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    
    -- Timing
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    -- Results
    verified_quantity INTEGER,
    verified_price DECIMAL(10, 2),
    verified_packaging VARCHAR(20),
    verified_metadata_hash VARCHAR(64),
    verified BOOLEAN,
    
    -- Error Handling & Blockchain
    error TEXT,
    transaction_hash VARCHAR(66),
    gas_used BIGINT,
    
    -- Additional tracking
    request_data JSONB,
    response_data JSONB
);

-- Redemption Requests
CREATE TABLE redemption_requests (
    id SERIAL PRIMARY KEY,
    redemption_id INTEGER UNIQUE,
    
    -- Core Request Data
    consumer VARCHAR(42) NOT NULL,
    batch_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    
    -- Delivery Information
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(50),
    delivery_zip VARCHAR(20),
    delivery_country VARCHAR(50) NOT NULL DEFAULT 'USA',
    special_instructions TEXT,
    
    -- Status & Timing
    status VARCHAR(20) NOT NULL DEFAULT 'Requested',
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    fulfillment_date TIMESTAMP,
    
    -- Additional Details
    packaging_info VARCHAR(20),
    tracking_number VARCHAR(100),
    
    -- Processing Info
    processed_by VARCHAR(42),
    processed_at TIMESTAMP
);

-- User Roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by VARCHAR(42) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    -- Extended fields for new user types
    company_name VARCHAR(255),
    location VARCHAR(255),
    certification_level VARCHAR(50),
    specialization VARCHAR(100),
    metadata JSONB
);

-- Inventory Audits
CREATE TABLE inventory_audits (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    audit_type VARCHAR(50) NOT NULL,
    auditor_address VARCHAR(42) NOT NULL,
    physical_quantity DECIMAL(10, 2) NOT NULL,
    discrepancy DECIMAL(10, 2) NOT NULL DEFAULT 0,
    audit_notes TEXT,
    audit_photos JSONB,
    location VARCHAR(255),
    audited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    resolution_notes TEXT
);

-- Batch Token Balances
CREATE TABLE batch_token_balances (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    holder_address VARCHAR(42) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    
    -- Transaction Tracking
    last_transaction_hash VARCHAR(66),
    last_transaction_at TIMESTAMP,
    
    -- Redemption Status
    is_redeemed BOOLEAN NOT NULL DEFAULT false,
    redeemed_at TIMESTAMP,
    redemption_tx_hash VARCHAR(66),
    
    -- Cached Batch Details
    cached_farm_name VARCHAR(255),
    cached_location VARCHAR(255),
    cached_packaging VARCHAR(20),
    cached_price_per_unit DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Batch Requests
CREATE TABLE batch_requests (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    requester VARCHAR(42) NOT NULL,
    requested_quantity INTEGER NOT NULL,
    request_details TEXT,
    request_timestamp BIGINT NOT NULL,
    is_fulfilled BOOLEAN NOT NULL DEFAULT false,
    fulfilled_quantity INTEGER DEFAULT 0,
    fulfilled_timestamp BIGINT,
    
    -- Additional tracking fields
    request_index INTEGER NOT NULL,
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_by VARCHAR(42),
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ZK Proofs
CREATE TABLE zk_proofs (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL UNIQUE,
    batch_id BIGINT NOT NULL,
    
    -- Proof Classification
    proof_type VARCHAR(50) NOT NULL,
    
    -- ZK Proof Data
    proof_hash VARCHAR(64) NOT NULL,
    proof_data JSONB NOT NULL,
    public_signals JSONB NOT NULL,
    public_claim TEXT NOT NULL,
    
    -- Verification Status
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_transaction_hash VARCHAR(66),
    verification_block_number BIGINT,
    verification_gas_used BIGINT,
    
    -- Circuit Information
    circuit_name VARCHAR(100) NOT NULL,
    circuit_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    verifier_contract_address VARCHAR(42),
    
    -- Metadata
    proof_generator_address VARCHAR(42) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Error Handling
    verification_error TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Privacy Configurations
CREATE TABLE batch_privacy_configs (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL UNIQUE,
    
    -- Privacy Level
    privacy_level privacy_level NOT NULL DEFAULT 'public',
    
    -- Individual Privacy Flags
    price_private BOOLEAN NOT NULL DEFAULT false,
    quality_private BOOLEAN NOT NULL DEFAULT false,
    supply_chain_private BOOLEAN NOT NULL DEFAULT false,
    quantity_private BOOLEAN NOT NULL DEFAULT false,
    farmer_details_private BOOLEAN NOT NULL DEFAULT false,
    
    -- Privacy Configuration
    configured_by VARCHAR(42) NOT NULL,
    configuration_reason TEXT,
    
    -- Access Control
    authorized_viewers JSONB DEFAULT '[]',
    access_expiry TIMESTAMP,
    
    -- Timestamps
    configured_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Protected Data
CREATE TABLE protected_batch_data (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    
    -- Data Classification
    data_type VARCHAR(50) NOT NULL,
    data_category VARCHAR(30) NOT NULL,
    
    -- Protected Data Storage
    data_hash VARCHAR(64) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    encrypted_data TEXT,
    encryption_method VARCHAR(20) DEFAULT 'AES-256-GCM',
    
    -- Access Control
    data_owner VARCHAR(42) NOT NULL,
    access_level VARCHAR(20) NOT NULL DEFAULT 'private',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ZK Verification History
CREATE TABLE zk_verification_history (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL,
    batch_id BIGINT NOT NULL,
    
    -- Verification Attempt Details
    verification_attempt INTEGER NOT NULL,
    verification_method VARCHAR(30) NOT NULL,
    verifier_address VARCHAR(42),
    
    -- Results
    verification_result VARCHAR(20) NOT NULL,
    verification_details JSONB,
    gas_used BIGINT,
    verification_fee DECIMAL(20, 8),
    
    -- Timing
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Error Handling
    error_code VARCHAR(20),
    error_message TEXT,
    
    -- Blockchain
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    block_timestamp TIMESTAMP
);

-- ZK Circuit Configurations
CREATE TABLE zk_circuit_configs (
    id SERIAL PRIMARY KEY,
    circuit_name VARCHAR(100) NOT NULL UNIQUE,
    
    -- Circuit Information
    circuit_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    verifier_contract_address VARCHAR(42) NOT NULL,
    circuit_description TEXT,
    
    -- Circuit Files
    circuit_wasm_hash VARCHAR(64),
    circuit_zkey_hash VARCHAR(64),
    proving_key_hash VARCHAR(64),
    
    -- Parameters
    max_constraints INTEGER,
    max_public_signals INTEGER,
    trusted_setup_hash VARCHAR(64),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    deployment_network VARCHAR(20) NOT NULL DEFAULT 'base-sepolia',
    
    -- Metadata
    deployed_by VARCHAR(42) NOT NULL,
    deployed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MIGRATION 003: New Integration Plan Tables
-- ============================================================================

-- Seller Registration System
CREATE TABLE seller_registrations (
    id SERIAL PRIMARY KEY,
    seller_address VARCHAR(42) NOT NULL UNIQUE,
    
    -- Ethiopian Legal Entity Information
    business_license_number VARCHAR(100) NOT NULL,
    tax_identification_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_business_type VARCHAR(50) NOT NULL,
    
    -- Location Information
    region VARCHAR(100) NOT NULL,
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
    annual_production_estimate INTEGER,
    coffee_varieties JSONB,
    certification_types JSONB,
    processing_methods JSONB,
    
    -- Banking Integration
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_swift_code VARCHAR(20),
    mobile_money_provider VARCHAR(50),
    mobile_money_number VARCHAR(20),
    
    -- Compliance Status
    kyc_status verification_status NOT NULL DEFAULT 'pending',
    kyc_completed_at TIMESTAMP,
    kyc_expires_at TIMESTAMP,
    compliance_level compliance_level NOT NULL DEFAULT 'basic',
    
    -- EUDR Compliance
    eudr_compliance_status verification_status DEFAULT 'pending',
    deforestation_risk_assessment VARCHAR(20),
    forest_monitoring_consent BOOLEAN DEFAULT false,
    
    -- Registration Status
    registration_status registration_status NOT NULL DEFAULT 'pending',
    registration_tier registration_tier NOT NULL DEFAULT 'bronze',
    
    -- Verification Documents (IPFS hashes)
    business_license_document VARCHAR(64),
    tax_certificate_document VARCHAR(64),
    identity_document VARCHAR(64),
    bank_statement_document VARCHAR(64),
    land_ownership_document VARCHAR(64),
    
    -- Processing Information
    registered_by VARCHAR(42),
    registered_at TIMESTAMP,
    last_updated_by VARCHAR(42),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ethiopian Compliance Tracking
CREATE TABLE ethiopian_compliance_records (
    id SERIAL PRIMARY KEY,
    seller_address VARCHAR(42) NOT NULL,
    batch_id BIGINT,
    
    -- Compliance Type
    compliance_type VARCHAR(50) NOT NULL,
    
    -- Export Documentation
    export_permit_number VARCHAR(100),
    export_permit_issuer VARCHAR(255),
    export_permit_valid_from DATE,
    export_permit_valid_until DATE,
    
    -- Quality Certification
    quality_grade VARCHAR(20),
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
    deforestation_assessment_result VARCHAR(20),
    forest_risk_score DECIMAL(3, 2),
    satellite_verification_date DATE,
    on_site_inspection_date DATE,
    
    -- Documentation (IPFS hashes)
    compliance_document_hash VARCHAR(64),
    supporting_documents JSONB,
    
    -- Verification Status
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by VARCHAR(42),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Validity
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Blockchain Integration
    compliance_proof_hash VARCHAR(64),
    blockchain_transaction_hash VARCHAR(66),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Banking Integration Transactions
CREATE TABLE banking_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Core Transaction Data
    seller_address VARCHAR(42) NOT NULL,
    batch_id BIGINT,
    transaction_type VARCHAR(30) NOT NULL,
    
    -- Financial Details
    amount_usd DECIMAL(20, 8) NOT NULL,
    amount_etb DECIMAL(20, 2),
    exchange_rate DECIMAL(10, 6),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    
    -- Payment Method
    payment_method VARCHAR(30) NOT NULL,
    bank_reference_number VARCHAR(100),
    mobile_money_reference VARCHAR(50),
    
    -- Transaction Status
    status transaction_status NOT NULL DEFAULT 'pending',
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
    chainlink_request_id VARCHAR(255),
    external_transaction_id VARCHAR(255),
    
    -- Error Handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Compliance
    aml_check_status VARCHAR(20) DEFAULT 'pending',
    kyc_verification_level VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enhanced ZK Compliance Proofs
CREATE TABLE zk_compliance_proofs (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL UNIQUE,
    batch_id BIGINT NOT NULL,
    
    -- Compliance-Specific Proof Types
    compliance_category VARCHAR(50) NOT NULL,
    
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
    regulatory_body VARCHAR(255),
    
    -- Integration
    smart_contract_verification_tx VARCHAR(66),
    ipfs_metadata_hash VARCHAR(64),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- System Configuration
CREATE TABLE system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) NOT NULL DEFAULT 'string',
    
    -- Configuration Categories
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    
    -- Access Control
    is_public BOOLEAN NOT NULL DEFAULT false,
    required_role VARCHAR(50),
    
    -- Validation
    validation_schema JSONB,
    default_value TEXT,
    
    -- Metadata
    description TEXT,
    last_modified_by VARCHAR(42),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    
    -- Entity Information
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    
    -- Change Information
    action audit_action NOT NULL,
    changed_fields JSONB,
    old_values JSONB,
    new_values JSONB,
    
    -- User Information
    user_address VARCHAR(42) NOT NULL,
    user_role VARCHAR(50),
    user_ip_address INET,
    
    -- Context
    reason TEXT,
    related_transaction_hash VARCHAR(66),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MIGRATION 004: Indexes for Performance
-- ============================================================================

-- Core table indexes
CREATE INDEX idx_waga_coffee_batches_batch_id ON waga_coffee_batches(batch_id);
CREATE INDEX idx_waga_coffee_batches_verified ON waga_coffee_batches(is_verified);
CREATE INDEX idx_waga_coffee_batches_product_type ON waga_coffee_batches(product_type);

-- Verification indexes
CREATE INDEX idx_verification_requests_batch_id ON verification_requests(batch_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- User and role indexes
CREATE INDEX idx_user_roles_address ON user_roles(user_address);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_active ON user_roles(is_active);

-- Token balance indexes
CREATE INDEX idx_batch_token_balances_batch_id ON batch_token_balances(batch_id);
CREATE INDEX idx_batch_token_balances_holder ON batch_token_balances(holder_address);
CREATE INDEX idx_batch_token_balances_redeemed ON batch_token_balances(is_redeemed);

-- ZK system indexes
CREATE INDEX idx_zk_proofs_batch_id ON zk_proofs(batch_id);
CREATE INDEX idx_zk_proofs_type ON zk_proofs(proof_type);
CREATE INDEX idx_zk_proofs_verified ON zk_proofs(is_verified);

-- New integration plan indexes
CREATE INDEX idx_seller_registrations_address ON seller_registrations(seller_address);
CREATE INDEX idx_seller_registrations_status ON seller_registrations(registration_status);
CREATE INDEX idx_seller_registrations_kyc ON seller_registrations(kyc_status);

CREATE INDEX idx_ethiopian_compliance_seller ON ethiopian_compliance_records(seller_address);
CREATE INDEX idx_ethiopian_compliance_batch ON ethiopian_compliance_records(batch_id);
CREATE INDEX idx_ethiopian_compliance_status ON ethiopian_compliance_records(verification_status);

CREATE INDEX idx_banking_transactions_seller ON banking_transactions(seller_address);
CREATE INDEX idx_banking_transactions_batch ON banking_transactions(batch_id);
CREATE INDEX idx_banking_transactions_status ON banking_transactions(status);
CREATE INDEX idx_banking_transactions_type ON banking_transactions(transaction_type);

CREATE INDEX idx_zk_compliance_batch ON zk_compliance_proofs(batch_id);
CREATE INDEX idx_zk_compliance_category ON zk_compliance_proofs(compliance_category);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_address);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- MIGRATION 005: Foreign Key Constraints
-- ============================================================================

-- Note: Some foreign keys point to blockchain data (batch_id) which may not have
-- corresponding rows in the database until blockchain events are processed

-- User role relationships
ALTER TABLE seller_registrations ADD CONSTRAINT fk_seller_registered_by 
    FOREIGN KEY (registered_by) REFERENCES user_roles(user_address);

ALTER TABLE ethiopian_compliance_records ADD CONSTRAINT fk_compliance_verified_by 
    FOREIGN KEY (verified_by) REFERENCES user_roles(user_address);

-- ZK proof relationships
ALTER TABLE zk_compliance_proofs ADD CONSTRAINT fk_zk_compliance_proof_id 
    FOREIGN KEY (proof_id) REFERENCES zk_proofs(proof_id);

-- System configuration relationships
ALTER TABLE system_configurations ADD CONSTRAINT fk_config_modified_by 
    FOREIGN KEY (last_modified_by) REFERENCES user_roles(user_address);

-- ============================================================================
-- MIGRATION 006: Default System Configurations
-- ============================================================================

-- Insert default system configurations
INSERT INTO system_configurations (config_key, config_value, config_type, category, description, is_public) VALUES
('blockchain.network', 'base-sepolia', 'string', 'blockchain', 'Current blockchain network', true),
('compliance.ethiopian.required', 'true', 'boolean', 'compliance', 'Ethiopian compliance required for coffee exports', true),
('compliance.eudr.required', 'true', 'boolean', 'compliance', 'EUDR compliance required for European markets', true),
('banking.usd_etb_enabled', 'true', 'boolean', 'banking', 'USD to ETB conversion enabled', false),
('zk.privacy.default_level', 'selective', 'string', 'zk_privacy', 'Default privacy level for new batches', false),
('seller.registration.auto_approve', 'false', 'boolean', 'seller', 'Automatically approve seller registrations', false),
('system.maintenance_mode', 'false', 'boolean', 'system', 'System maintenance mode status', true);

-- ============================================================================
-- MIGRATION 007: Initial Admin User
-- ============================================================================

-- Insert default admin user (update with actual admin address)
INSERT INTO user_roles (user_address, role, permissions, assigned_by, company_name) VALUES
('0x0000000000000000000000000000000000000000', 'admin', '["all"]', '0x0000000000000000000000000000000000000000', 'WAGA Coffee System');

-- Grant the admin user system configuration access
UPDATE system_configurations SET last_modified_by = '0x0000000000000000000000000000000000000000';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration completion
SELECT 'Migration completed successfully. Tables created:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;