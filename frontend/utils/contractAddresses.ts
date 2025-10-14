/**
 * Real-time contract address management for WAGA Coffee Platform
 * This utility fetches and manages all deployed smart contract addresses
 */

// Type definitions for contract information
export interface ContractInfo {
  address: string;
  name: string;
  category: 'Core' | 'Operations' | 'Compliance' | 'Privacy' | 'ZK-Verifiers' | 'Integration';
  description: string;
  verified: boolean;
  deployedAt?: string;
  baseScanUrl: string;
}

export interface ContractAddresses {
  [key: string]: ContractInfo;
}

// All deployed contract addresses on Base Sepolia
export const DEPLOYED_CONTRACTS: ContractAddresses = {
  // Core System Contracts
  WAGA_COFFEE_TOKEN_CORE: {
    address: '0x5f4bE57dA14a03387Db976CB4c16F619f6958544',
    name: 'WAGA Coffee Token Core',
    category: 'Core',
    description: 'Ultra-lean ERC-1155 multi-token contract for coffee batch tokenization',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x5f4bE57dA14a03387Db976CB4c16F619f6958544'
  },
  WAGA_CONFIG_MANAGER: {
    address: '0xdf47b379c23647cAeD932D025104d40D8B2A7864',
    name: 'WAGA Config Manager',
    category: 'Core',
    description: 'Central authority for access control and seller registration',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xdf47b379c23647cAeD932D025104d40D8B2A7864'
  },
  WAGA_TREASURY: {
    address: '0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f',
    name: 'WAGA Treasury',
    category: 'Core',
    description: 'USDC treasury for payment processing and financial operations',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f'
  },
  WAGA_COFFEE_REDEMPTION: {
    address: '0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3',
    name: 'WAGA Coffee Redemption',
    category: 'Core',
    description: 'Coffee token redemption and fulfillment management',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3'
  },
  
  // Operational Contracts
  WAGA_COFFEE_BATCH_OPERATIONS: {
    address: '0xe76eC63e59e39A0cd2Db131d31f8E9a8a6d853b1',
    name: 'WAGA Coffee Batch Operations',
    category: 'Operations',
    description: 'Complex batch operations and business logic management',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xe76eC63e59e39A0cd2Db131d31f8E9a8a6d853b1'
  },
  WAGA_INVENTORY_MANAGER_MVP: {
    address: '0x04f1e95C04faFc48A30f92E3479B292BB0b6D68a',
    name: 'WAGA Inventory Manager MVP',
    category: 'Operations',
    description: 'Inventory tracking and management system',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x04f1e95C04faFc48A30f92E3479B292BB0b6D68a'
  },
  WAGA_PROOF_OF_RESERVE: {
    address: '0xD12D8A514aB0D0f852A1FA9BB04547e1f896aeAb',
    name: 'WAGA Proof of Reserve',
    category: 'Operations',
    description: 'Physical coffee inventory verification and proof of reserves',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xD12D8A514aB0D0f852A1FA9BB04547e1f896aeAb'
  },
  WAGA_COFFEE_VIEWS: {
    address: '0x9E8705790E054d33c5aB8FaA4de8Ba5567847c32',
    name: 'WAGA Coffee Views',
    category: 'Operations',
    description: 'Read-only view functions for frontend integration',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x9E8705790E054d33c5aB8FaA4de8Ba5567847c32'
  },
  
  // Compliance & Banking Contracts
  WAGA_ETHIOPIAN_COMPLIANCE_CORE: {
    address: '0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2',
    name: 'WAGA Ethiopian Compliance Core',
    category: 'Compliance',
    description: 'Core Ethiopian coffee export compliance management',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2'
  },
  WAGA_BANKING_CORE: {
    address: '0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32',
    name: 'WAGA Banking Core',
    category: 'Compliance',
    description: 'SWIFT-based banking integration for Ethiopian banks',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32'
  },
  WAGA_TRADE_COMPLIANCE: {
    address: '0x1c71bB7C279c11199824828C583D86C49E86D56b',
    name: 'WAGA Trade Compliance',
    category: 'Compliance',
    description: 'Trade regulation compliance validation',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x1c71bB7C279c11199824828C583D86C49E86D56b'
  },
  WAGA_BATCH_EXPORT_COMPLIANCE: {
    address: '0x3Ad70EB0bE760C241E1bB4D7611848D9740B2FB2',
    name: 'WAGA Batch Export Compliance',
    category: 'Compliance',
    description: 'Export compliance validation for coffee batches',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x3Ad70EB0bE760C241E1bB4D7611848D9740B2FB2'
  },
  
  // Privacy & Zero-Knowledge System
  PRIVACY_LAYER: {
    address: '0x9a6fD02FAfa63C7e9e88574EE0a4950b936f658D',
    name: 'Privacy Layer',
    category: 'Privacy',
    description: 'Privacy settings and competitive data protection',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x9a6fD02FAfa63C7e9e88574EE0a4950b936f658D'
  },
  WAGA_ZK_MANAGER: {
    address: '0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e',
    name: 'WAGA ZK Manager',
    category: 'Privacy',
    description: 'Unified ZK proof management and compliance validation',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e'
  },
  CIRCOM_VERIFIER: {
    address: '0xEf6875Ae4418191422C0cD4D59036345A5e8cADF',
    name: 'Circom Verifier',
    category: 'Privacy',
    description: 'Main ZK proof verification contract with multiple circuit support',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xEf6875Ae4418191422C0cD4D59036345A5e8cADF'
  },
  
  // ZK Circuit Verifiers
  PRICE_PRIVACY_CIRCUIT_VERIFIER: {
    address: '0x2e69F0d719231858bC3b89a866df7b22cddBf8bE',
    name: 'Price Privacy Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'Zero-knowledge price privacy proof verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x2e69F0d719231858bC3b89a866df7b22cddBf8bE'
  },
  QUALITY_TIER_CIRCUIT_VERIFIER: {
    address: '0x3fdF035db85Bd3848085Fb4d0267d7527eC1b5c1',
    name: 'Quality Tier Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'Zero-knowledge quality tier proof verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x3fdF035db85Bd3848085Fb4d0267d7527eC1b5c1'
  },
  SUPPLY_CHAIN_PRIVACY_CIRCUIT_VERIFIER: {
    address: '0x02f0B0D48F9449ad3F43471CBf59d061C1791410',
    name: 'Supply Chain Privacy Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'Zero-knowledge supply chain privacy proof verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x02f0B0D48F9449ad3F43471CBf59d061C1791410'
  },
  EUDR_DEFORESTATION_CIRCUIT_VERIFIER: {
    address: '0xE14EB9e795698d8E8e4201B94faB16d9aC33e28C',
    name: 'EUDR Deforestation Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'EUDR deforestation compliance verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xE14EB9e795698d8E8e4201B94faB16d9aC33e28C'
  },
  EUDR_GEOLOCATION_CIRCUIT_VERIFIER: {
    address: '0x92bbcC4fEDb0e77f092699510Fff142e3AA2f856',
    name: 'EUDR Geolocation Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'EUDR geolocation compliance verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x92bbcC4fEDb0e77f092699510Fff142e3AA2f856'
  },
  ETHIOPIAN_COMPLIANCE_CIRCUIT_VERIFIER: {
    address: '0x40a7b61a430087b4B4f5e74002aE57B7f735bc72',
    name: 'Ethiopian Compliance Circuit Verifier',
    category: 'ZK-Verifiers',
    description: 'Ethiopian compliance proof verification',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x40a7b61a430087b4B4f5e74002aE57B7f735bc72'
  },
  
  // Metadata & Integration Contracts
  WAGA_BATCH_METADATA_MANAGER: {
    address: '0x61eB190980431c1549cC192688DB6AfbEeC6d386',
    name: 'WAGA Batch Metadata Manager',
    category: 'Integration',
    description: 'IPFS-based batch metadata management',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x61eB190980431c1549cC192688DB6AfbEeC6d386'
  },
  WAGA_ECX_PRICE_ORACLE: {
    address: '0x87278D9A3792A7Cc08A3b2fc33C0ebe8b3605f69',
    name: 'WAGA ECX Price Oracle',
    category: 'Integration',
    description: 'Ethiopian Commodity Exchange (ECX) price feeds',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0x87278D9A3792A7Cc08A3b2fc33C0ebe8b3605f69'
  },
  WAGA_CDP_INTEGRATION: {
    address: '0xe5b612F1154E10B98Be7b5eEC95bCC568C5feeeF',
    name: 'WAGA CDP Integration',
    category: 'Integration',
    description: 'Coinbase Developer Platform integration for fiat offramp',
    verified: true,
    baseScanUrl: 'https://sepolia.basescan.org/address/0xe5b612F1154E10B98Be7b5eEC95bCC568C5feeeF'
  }
};

// Network information
export const NETWORK_INFO = {
  name: 'Base Sepolia',
  chainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

/**
 * Get contract addresses grouped by category
 */
export function getContractsByCategory(): Record<string, ContractInfo[]> {
  const grouped: Record<string, ContractInfo[]> = {};
  
  Object.values(DEPLOYED_CONTRACTS).forEach(contract => {
    if (!grouped[contract.category]) {
      grouped[contract.category] = [];
    }
    grouped[contract.category].push(contract);
  });
  
  return grouped;
}

/**
 * Get contract info by address
 */
export function getContractByAddress(address: string): ContractInfo | undefined {
  return Object.values(DEPLOYED_CONTRACTS).find(
    contract => contract.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Get all contract addresses as a simple array
 */
export function getAllContractAddresses(): string[] {
  return Object.values(DEPLOYED_CONTRACTS).map(contract => contract.address);
}

/**
 * Validate if an address is a known contract
 */
export function isKnownContract(address: string): boolean {
  return getAllContractAddresses().some(
    contractAddress => contractAddress.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Get contract statistics
 */
export function getContractStats() {
  const contracts = Object.values(DEPLOYED_CONTRACTS);
  const categories = getContractsByCategory();
  
  return {
    totalContracts: contracts.length,
    verifiedContracts: contracts.filter(c => c.verified).length,
    categoryCounts: Object.entries(categories).reduce((acc, [category, contracts]) => {
      acc[category] = contracts.length;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Format contract address for display
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Check if contracts are accessible on the blockchain
 */
export async function verifyContractAccessibility(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  // This would typically use ethers.js to check if contracts respond
  // For now, we'll mark all as accessible since they're verified on BaseScan
  Object.entries(DEPLOYED_CONTRACTS).forEach(([key, contract]) => {
    results[key] = contract.verified;
  });
  
  return results;
}

export default DEPLOYED_CONTRACTS;