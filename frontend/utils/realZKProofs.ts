import fs from 'fs';
import path from 'path';
import { ProofType } from './types';

/**
 * Real ZK proof data for testing production circuits
 */
export interface RealZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  circuitName: string;
  proofType: ProofType;
}

/**
 * Load real ZK proof data from circuits/build directory
 */
export function loadRealZKProof(circuitName: string, proofType: ProofType): RealZKProof | null {
  try {
    const circuitsPath = '/Users/manu-acho/foundry_2/WAGA_MVP_V2/circuits/build';
    const proofPath = path.join(circuitsPath, circuitName, 'proof.json');
    const publicPath = path.join(circuitsPath, circuitName, 'public.json');

    // Check if files exist
    if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath)) {
      console.warn(`Real ZK proof files not found for ${circuitName}`);
      return null;
    }

    const proofData = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

    return {
      proof: proofData,
      publicSignals,
      circuitName,
      proofType
    };
  } catch (error) {
    console.error(`Error loading real ZK proof for ${circuitName}:`, error);
    return null;
  }
}

/**
 * Get available real ZK proofs for testing
 */
export function getAvailableRealProofs(): RealZKProof[] {
  const availableProofs: RealZKProof[] = [];

  // Map of circuit names to their proof types
  const circuitMap: { [key: string]: ProofType } = {
    'PricePrivacyCircuit': ProofType.PRICE_COMPETITIVENESS,
    'QualityTierCircuit': ProofType.QUALITY_STANDARDS,
    'SupplyChainPrivacyCircuit': ProofType.SUPPLY_CHAIN_PROVENANCE
  };

  for (const [circuitName, proofType] of Object.entries(circuitMap)) {
    const proof = loadRealZKProof(circuitName, proofType);
    if (proof) {
      availableProofs.push(proof);
    }
  }

  return availableProofs;
}

/**
 * Convert real proof to format expected by Circom verifier
 */
export function convertToCircomFormat(realProof: RealZKProof) {
  return {
    a: realProof.proof.pi_a.slice(0, 2), // First two elements
    b: realProof.proof.pi_b.slice(0, 2), // First two elements of each array
    c: realProof.proof.pi_c.slice(0, 2), // First two elements
    publicSignals: realProof.publicSignals
  };
}

/**
 * Generate real ZK proof hash using actual proof data
 */
export function generateRealZKProofHash(circuitName: string, proofType: ProofType): string | null {
  const realProof = loadRealZKProof(circuitName, proofType);
  if (!realProof) {
    return null;
  }

  // Create a deterministic hash from the proof
  const proofString = JSON.stringify({
    proof: realProof.proof,
    publicSignals: realProof.publicSignals,
    circuitName: realProof.circuitName,
    timestamp: Math.floor(Date.now() / 1000) // Round to seconds for consistency
  });

  // Simple hash function for demonstration
  let hash = 0;
  for (let i = 0; i < proofString.length; i++) {
    const char = proofString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}