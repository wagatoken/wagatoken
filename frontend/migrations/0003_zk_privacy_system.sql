-- Migration: Add ZK Privacy System Tables
-- Description: Adds database support for zero-knowledge proofs and privacy features
-- Created: 2025-09-16

-- ZK Proofs Table - Store zero-knowledge proof data
CREATE TABLE zk_proofs (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) UNIQUE NOT NULL, -- Unique identifier for the proof
    batch_id BIGINT NOT NULL, -- References waga_coffee_batches.batch_id
    
    -- Proof Classification (matches IZKVerifier.ProofType)
    proof_type VARCHAR(30) NOT NULL CHECK (proof_type IN ('PRICE_COMPETITIVENESS', 'QUALITY_STANDARDS', 'SUPPLY_CHAIN_PROVENANCE')),
    
    -- ZK Proof Data
    proof_hash CHAR(64) NOT NULL, -- keccak256 hash of the proof
    proof_data JSONB NOT NULL, -- Complete ZK proof (a, b, c points, etc.)
    public_signals JSONB NOT NULL, -- Public inputs to the circuit
    public_claim TEXT NOT NULL, -- Human-readable claim (e.g., "Premium Quality")
    
    -- Verification Status
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_transaction_hash CHAR(66), -- Ethereum transaction hash
    verification_block_number BIGINT,
    verification_gas_used BIGINT,
    
    -- Circuit Information
    circuit_name VARCHAR(100) NOT NULL, -- e.g., "PricePrivacyCircuit"
    circuit_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    verifier_contract_address CHAR(42), -- Address of the verifier contract
    
    -- Metadata
    proof_generator_address CHAR(42) NOT NULL, -- Who generated this proof
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
    
    -- Error Handling
    verification_error TEXT, -- Error message if verification failed
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Privacy Configurations Table - Track privacy settings per batch
CREATE TABLE batch_privacy_configs (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL UNIQUE, -- References waga_coffee_batches.batch_id
    
    -- Privacy Level (matches IPrivacyLayer.PrivacyLevel)
    privacy_level VARCHAR(20) NOT NULL CHECK (privacy_level IN ('public', 'selective', 'private')) DEFAULT 'public',
    
    -- Individual Privacy Flags
    price_private BOOLEAN NOT NULL DEFAULT false,
    quality_private BOOLEAN NOT NULL DEFAULT false,
    supply_chain_private BOOLEAN NOT NULL DEFAULT false,
    quantity_private BOOLEAN NOT NULL DEFAULT false,
    farmer_details_private BOOLEAN NOT NULL DEFAULT false,
    
    -- Privacy Configuration
    configured_by CHAR(42) NOT NULL, -- Admin who set the configuration
    configuration_reason TEXT, -- Why this privacy level was chosen
    
    -- Access Control
    authorized_viewers JSONB DEFAULT '[]', -- Array of addresses that can view private data
    access_expiry TIMESTAMP WITH TIME ZONE, -- When access expires
    
    -- Timestamps
    configured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Protected Data Table - Store encrypted/protected sensitive data
CREATE TABLE protected_batch_data (
    id SERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL, -- References waga_coffee_batches.batch_id
    
    -- Data Classification
    data_type VARCHAR(50) NOT NULL, -- 'exact_price', 'quality_scores', 'farmer_personal_info', etc.
    data_category VARCHAR(30) NOT NULL CHECK (data_category IN ('price', 'quality', 'supply_chain', 'farmer', 'other')),
    
    -- Protected Data Storage
    data_hash CHAR(64) NOT NULL, -- Hash of the original data
    salt CHAR(64) NOT NULL, -- Salt used for hashing
    encrypted_data TEXT, -- Encrypted sensitive data (optional)
    encryption_method VARCHAR(20) DEFAULT 'AES-256-GCM',
    
    -- Access Control
    data_owner CHAR(42) NOT NULL, -- Who owns this data
    access_level VARCHAR(20) NOT NULL DEFAULT 'private', -- 'public', 'restricted', 'private'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ZK Verification History Table - Audit trail for ZK verifications
CREATE TABLE zk_verification_history (
    id SERIAL PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL, -- References zk_proofs.proof_id
    batch_id BIGINT NOT NULL, -- References waga_coffee_batches.batch_id
    
    -- Verification Attempt Details
    verification_attempt INTEGER NOT NULL, -- 1st attempt, 2nd attempt, etc.
    verification_method VARCHAR(30) NOT NULL, -- 'on_chain', 'off_chain', 'hybrid'
    verifier_address CHAR(42), -- Contract or service that verified
    
    -- Results
    verification_result VARCHAR(20) NOT NULL CHECK (verification_result IN ('success', 'failed', 'pending', 'timeout')),
    verification_details JSONB, -- Detailed results or error info
    gas_used BIGINT, -- Gas used for on-chain verification
    verification_fee DECIMAL(20,8), -- Cost of verification
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER, -- Verification duration in milliseconds
    
    -- Error Handling
    error_code VARCHAR(20),
    error_message TEXT,
    
    -- Blockchain
    transaction_hash CHAR(66), -- Ethereum transaction hash
    block_number BIGINT,
    block_timestamp TIMESTAMP WITH TIME ZONE
);

-- ZK Circuit Parameters Table - Store circuit-specific configuration
CREATE TABLE zk_circuit_configs (
    id SERIAL PRIMARY KEY,
    circuit_name VARCHAR(100) NOT NULL UNIQUE, -- 'PricePrivacyCircuit', 'QualityTierCircuit', etc.
    
    -- Circuit Information
    circuit_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    verifier_contract_address CHAR(42) NOT NULL, -- Deployed verifier contract
    circuit_description TEXT,
    
    -- Circuit Files
    circuit_wasm_hash CHAR(64), -- Hash of the .wasm file
    circuit_zkey_hash CHAR(64), -- Hash of the .zkey file
    proving_key_hash CHAR(64), -- Hash of the proving key
    
    -- Parameters
    max_constraints INTEGER, -- Circuit size
    max_public_signals INTEGER, -- Number of public inputs
    trusted_setup_hash CHAR(64), -- Hash of trusted setup ceremony
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    deployment_network VARCHAR(20) NOT NULL DEFAULT 'base-sepolia',
    
    -- Metadata
    deployed_by CHAR(42) NOT NULL, -- Who deployed this circuit
    deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_zk_proofs_batch_id ON zk_proofs(batch_id);
CREATE INDEX idx_zk_proofs_type ON zk_proofs(proof_type);
CREATE INDEX idx_zk_proofs_verified ON zk_proofs(is_verified);
CREATE INDEX idx_zk_proofs_generator ON zk_proofs(proof_generator_address);
CREATE INDEX idx_zk_proofs_created_at ON zk_proofs(created_at);

CREATE INDEX idx_privacy_configs_batch_id ON batch_privacy_configs(batch_id);
CREATE INDEX idx_privacy_configs_level ON batch_privacy_configs(privacy_level);

CREATE INDEX idx_protected_data_batch_id ON protected_batch_data(batch_id);
CREATE INDEX idx_protected_data_type ON protected_batch_data(data_type);
CREATE INDEX idx_protected_data_owner ON protected_batch_data(data_owner);

CREATE INDEX idx_verification_history_proof_id ON zk_verification_history(proof_id);
CREATE INDEX idx_verification_history_batch_id ON zk_verification_history(batch_id);
CREATE INDEX idx_verification_history_result ON zk_verification_history(verification_result);
CREATE INDEX idx_verification_history_started_at ON zk_verification_history(started_at);

CREATE INDEX idx_circuit_configs_name ON zk_circuit_configs(circuit_name);
CREATE INDEX idx_circuit_configs_active ON zk_circuit_configs(is_active);

-- Comments for Documentation
COMMENT ON TABLE zk_proofs IS 'Store zero-knowledge proofs for coffee batch privacy';
COMMENT ON TABLE batch_privacy_configs IS 'Privacy configuration settings per coffee batch';
COMMENT ON TABLE protected_batch_data IS 'Encrypted/protected sensitive data storage';
COMMENT ON TABLE zk_verification_history IS 'Audit trail for ZK proof verification attempts';
COMMENT ON TABLE zk_circuit_configs IS 'ZK circuit deployment and configuration data';

-- Update the schema version
INSERT INTO schema_migrations (migration_name, applied_at) VALUES ('0003_zk_privacy_system', NOW())
ON CONFLICT (migration_name) DO NOTHING;
