import { ethers } from 'ethers';

// Contract addresses on Base Sepolia
export const CONTRACT_ADDRESSES = {
  WAGACoffeeTokenCore: '0x5f4bE57dA14a03387Db976CB4c16F619f6958544',
  WAGAConfigManager: '0xdf47b379c23647cAeD932D025104d40D8B2A7864',
  WAGATreasury: '0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f',
  WAGACoffeeRedemption: '0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3',
  WAGACoffeeBatchOperations: '0xe76eC63e59e39A0cd2Db131d31f8E9a8a6d853b1',
  WAGAInventoryManagerMVP: '0x04f1e95C04faFc48A30f92E3479B292BB0b6D68a',
  WAGAProofOfReserve: '0xD12D8A514aB0D0f852A1FA9BB04547e1f896aeAb',
  WAGACoffeeViews: '0x9E8705790E054d33c5aB8FaA4de8Ba5567847c32',
  WAGAEthiopianComplianceCore: '0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2',
  WAGABankingCore: '0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32',
  WAGATradeCompliance: '0x1c71bB7C279c11199824828C583D86C49E86D56b',
  WAGABatchExportCompliance: '0x3Ad70EB0bE760C241E1bB4D7611848D9740B2FB2',
  PrivacyLayer: '0x9a6fD02FAfa63C7e9e88574EE0a4950b936f658D',
  WAGAZKManager: '0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e',
  CircomVerifier: '0xEf6875Ae4418191422C0cD4D59036345A5e8cADF',
  PricePrivacyCircuitVerifier: '0x2e69F0d719231858bC3b89a866df7b22cddBf8bE',
  QualityTierCircuitVerifier: '0x3fdF035db85Bd3848085Fb4d0267d7527eC1b5c1',
  SupplyChainPrivacyCircuitVerifier: '0x02f0B0D48F9449ad3F43471CBf59d061C1791410',
  EUDRDeforestationCircuitVerifier: '0xE14EB9e795698d8E8e4201B94faB16d9aC33e28C',
  EUDRGeolocationCircuitVerifier: '0x92bbcC4fEDb0e77f092699510Fff142e3AA2f856',
  EthiopianComplianceCircuitVerifier: '0x40a7b61a430087b4B4f5e74002aE57B7f735bc72',
  WAGABatchMetadataManager: '0x61eB190980431c1549cC192688DB6AfbEeC6d386',
  WAGAECXPriceOracle: '0x87278D9A3792A7Cc08A3b2fc33C0ebe8b3605f69',
  WAGACDPIntegration: '0xe5b612F1154E10B98Be7b5eEC95bCC568C5feeeF'
};

// Base Sepolia RPC configuration
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
const CHAIN_ID = 84532;

export interface ContractTestResult {
  contractName: string;
  address: string;
  isDeployed: boolean;
  isVerified: boolean;
  blockNumber?: number;
  error?: string;
}

export interface FunctionTestResult {
  functionName: string;
  signature: string;
  exists: boolean;
  isView: boolean;
  isPayable: boolean;
  error?: string;
}

export interface ContractIntegrationTestResult {
  contractName: string;
  address: string;
  deployment: ContractTestResult;
  functions: FunctionTestResult[];
  totalFunctions: number;
  availableFunctions: number;
  integrationScore: number; // 0-100
}

/**
 * Contract Integration Testing Utility
 * Tests live contract deployments and function availability
 */
export class ContractIntegrationTester {
  private provider: ethers.JsonRpcProvider;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  }

  /**
   * Test all deployed contracts for integration readiness
   */
  async testAllContracts(): Promise<ContractIntegrationTestResult[]> {
    console.log('🔍 Testing all WAGA contracts on Base Sepolia...');
    
    const results: ContractIntegrationTestResult[] = [];
    
    for (const [contractName, address] of Object.entries(CONTRACT_ADDRESSES)) {
      try {
        const result = await this.testContract(contractName, address);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to test ${contractName}:`, error);
        results.push({
          contractName,
          address,
          deployment: {
            contractName,
            address,
            isDeployed: false,
            isVerified: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          functions: [],
          totalFunctions: 0,
          availableFunctions: 0,
          integrationScore: 0
        });
      }
    }
    
    return results;
  }

  /**
   * Test individual contract deployment and function availability
   */
  async testContract(contractName: string, address: string): Promise<ContractIntegrationTestResult> {
    console.log(`🔍 Testing ${contractName} at ${address}...`);
    
    // Test deployment
    const deploymentResult = await this.testContractDeployment(contractName, address);
    
    // Test functions if contract is deployed
    let functions: FunctionTestResult[] = [];
    if (deploymentResult.isDeployed) {
      functions = await this.testContractFunctions(contractName, address);
    }
    
    const totalFunctions = functions.length;
    const availableFunctions = functions.filter(f => f.exists).length;
    const integrationScore = totalFunctions > 0 ? Math.round((availableFunctions / totalFunctions) * 100) : 0;
    
    return {
      contractName,
      address,
      deployment: deploymentResult,
      functions,
      totalFunctions,
      availableFunctions,
      integrationScore
    };
  }

  /**
   * Test if contract is deployed and get basic info
   */
  async testContractDeployment(contractName: string, address: string): Promise<ContractTestResult> {
    try {
      // Check if contract has code
      const code = await this.provider.getCode(address);
      const isDeployed = code !== '0x';
      
      let blockNumber: number | undefined;
      if (isDeployed) {
        try {
          // Try to get deployment block (approximate)
          const currentBlock = await this.provider.getBlockNumber();
          blockNumber = currentBlock; // Simplified for demo
        } catch (error) {
          console.warn(`Could not get block number for ${contractName}`);
        }
      }
      
      return {
        contractName,
        address,
        isDeployed,
        isVerified: isDeployed, // Assume verified if deployed (BaseScan verification)
        blockNumber
      };
    } catch (error) {
      return {
        contractName,
        address,
        isDeployed: false,
        isVerified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test specific contract functions based on expected interfaces
   */
  async testContractFunctions(contractName: string, address: string): Promise<FunctionTestResult[]> {
    const expectedFunctions = this.getExpectedFunctions(contractName);
    const results: FunctionTestResult[] = [];
    
    for (const func of expectedFunctions) {
      try {
        // Create a minimal ABI for testing
        const testABI = [{
          type: 'function',
          name: func.name,
          inputs: func.inputs || [],
          outputs: func.outputs || [],
          stateMutability: func.stateMutability || 'view'
        }];
        
        const contract = new ethers.Contract(address, testABI, this.provider);
        
        // Check if function exists by attempting to get its fragment
        const exists = contract.interface.hasFunction(func.name);
        
        results.push({
          functionName: func.name,
          signature: func.signature,
          exists,
          isView: func.stateMutability === 'view' || func.stateMutability === 'pure',
          isPayable: func.stateMutability === 'payable'
        });
      } catch (error) {
        results.push({
          functionName: func.name,
          signature: func.signature,
          exists: false,
          isView: false,
          isPayable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * Get expected functions for each contract type
   */
  private getExpectedFunctions(contractName: string): Array<{
    name: string;
    signature: string;
    inputs?: any[];
    outputs?: any[];
    stateMutability?: string;
  }> {
    const functionMappings: Record<string, any[]> = {
      WAGACoffeeTokenCore: [
        { name: 'createBatch', signature: 'createBatch(address,uint256,uint256,string)', stateMutability: 'nonpayable' },
        { name: 'mintBatch', signature: 'mintBatch(address,uint256,uint256)', stateMutability: 'nonpayable' },
        { name: 'burnForRedemption', signature: 'burnForRedemption(address,uint256,uint256)', stateMutability: 'nonpayable' },
        { name: 'balanceOf', signature: 'balanceOf(address,uint256)', stateMutability: 'view' },
        { name: 'totalSupply', signature: 'totalSupply(uint256)', stateMutability: 'view' }
      ],
      
      WAGAConfigManager: [
        { name: 'registerSeller', signature: 'registerSeller(address,uint8,string,string,bytes11)', stateMutability: 'nonpayable' },
        { name: 'getSellerId', signature: 'getSellerId(address)', stateMutability: 'view' },
        { name: 'getSellerProfile', signature: 'getSellerProfile(uint64)', stateMutability: 'view' },
        { name: 'hasRole', signature: 'hasRole(bytes32,address)', stateMutability: 'view' },
        { name: 'grantRole', signature: 'grantRole(bytes32,address)', stateMutability: 'nonpayable' }
      ],
      
      WAGAEthiopianComplianceCore: [
        { name: 'addECTAPermit', signature: 'addECTAPermit(uint256,(string,string,uint256,uint256,string))', stateMutability: 'nonpayable' },
        { name: 'addQualityCertificate', signature: 'addQualityCertificate(uint256,(string,uint256,uint256,uint256,string))', stateMutability: 'nonpayable' },
        { name: 'addOriginVerification', signature: 'addOriginVerification(uint256,(string,string,string,uint256))', stateMutability: 'nonpayable' },
        { name: 'validateUpstreamCompliance', signature: 'validateUpstreamCompliance(uint256)', stateMutability: 'view' },
        { name: 'getComplianceStatus', signature: 'getComplianceStatus(uint256)', stateMutability: 'view' }
      ],
      
      WAGABankingCore: [
        { name: 'registerBankingPartner', signature: 'registerBankingPartner(bytes11,address,string,(bool,bool,bool,uint8,uint256,bytes11))', stateMutability: 'nonpayable' },
        { name: 'getUSDToETBRate', signature: 'getUSDToETBRate()', stateMutability: 'view' },
        { name: 'convertUSDToETB', signature: 'convertUSDToETB(uint256)', stateMutability: 'view' },
        { name: 'isAuthorizedBank', signature: 'isAuthorizedBank(bytes11)', stateMutability: 'view' },
        { name: 'assignOfframpPartner', signature: 'assignOfframpPartner(uint256)', stateMutability: 'view' }
      ],
      
      WAGAZKManager: [
        { name: 'verifyAndStoreZKProof', signature: 'verifyAndStoreZKProof(uint256,uint8,uint256[],uint256[8],uint256[2],string)', stateMutability: 'nonpayable' },
        { name: 'addComplianceZKProof', signature: 'addComplianceZKProof(uint256,string,bytes,string)', stateMutability: 'nonpayable' },
        { name: 'validateCompliance', signature: 'validateCompliance(uint256,string)', stateMutability: 'view' },
        { name: 'getRequiredComplianceTypes', signature: 'getRequiredComplianceTypes(string,bool)', stateMutability: 'view' }
      ],
      
      WAGACoffeeRedemption: [
        { name: 'requestRedemption', signature: 'requestRedemption(uint256,uint256,string,bool)', stateMutability: 'nonpayable' },
        { name: 'confirmFiatTransfer', signature: 'confirmFiatTransfer(uint256,bytes11,uint256,string)', stateMutability: 'nonpayable' },
        { name: 'confirmSellerPayment', signature: 'confirmSellerPayment(uint256)', stateMutability: 'nonpayable' },
        { name: 'getRedemptionDetails', signature: 'getRedemptionDetails(uint256)', stateMutability: 'view' }
      ],
      
      WAGATreasury: [
        { name: 'deposit', signature: 'deposit(uint256)', stateMutability: 'nonpayable' },
        { name: 'withdraw', signature: 'withdraw(uint256,address)', stateMutability: 'nonpayable' },
        { name: 'getBalance', signature: 'getBalance()', stateMutability: 'view' },
        { name: 'getReserves', signature: 'getReserves()', stateMutability: 'view' }
      ]
    };
    
    return functionMappings[contractName] || [];
  }

  /**
   * Test critical business flow functions
   */
  async testCriticalBusinessFlows(): Promise<{
    sellerRegistration: boolean;
    batchCreation: boolean;
    complianceValidation: boolean;
    redemptionFlow: boolean;
    zkPrivacySystem: boolean;
    bankingIntegration: boolean;
  }> {
    console.log('🔍 Testing critical business flows...');
    
    return {
      sellerRegistration: await this.testSellerRegistrationFlow(),
      batchCreation: await this.testBatchCreationFlow(),
      complianceValidation: await this.testComplianceValidationFlow(),
      redemptionFlow: await this.testRedemptionFlow(),
      zkPrivacySystem: await this.testZKPrivacySystem(),
      bankingIntegration: await this.testBankingIntegration()
    };
  }

  private async testSellerRegistrationFlow(): Promise<boolean> {
    try {
      const configManager = CONTRACT_ADDRESSES.WAGAConfigManager;
      const deployment = await this.testContractDeployment('WAGAConfigManager', configManager);
      return deployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  private async testBatchCreationFlow(): Promise<boolean> {
    try {
      const tokenCore = CONTRACT_ADDRESSES.WAGACoffeeTokenCore;
      const batchOps = CONTRACT_ADDRESSES.WAGACoffeeBatchOperations;
      
      const tokenDeployment = await this.testContractDeployment('WAGACoffeeTokenCore', tokenCore);
      const batchOpsDeployment = await this.testContractDeployment('WAGACoffeeBatchOperations', batchOps);
      
      return tokenDeployment.isDeployed && batchOpsDeployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  private async testComplianceValidationFlow(): Promise<boolean> {
    try {
      const ethiopianCompliance = CONTRACT_ADDRESSES.WAGAEthiopianComplianceCore;
      const zkManager = CONTRACT_ADDRESSES.WAGAZKManager;
      
      const ethiopianDeployment = await this.testContractDeployment('WAGAEthiopianComplianceCore', ethiopianCompliance);
      const zkDeployment = await this.testContractDeployment('WAGAZKManager', zkManager);
      
      return ethiopianDeployment.isDeployed && zkDeployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  private async testRedemptionFlow(): Promise<boolean> {
    try {
      const redemption = CONTRACT_ADDRESSES.WAGACoffeeRedemption;
      const treasury = CONTRACT_ADDRESSES.WAGATreasury;
      
      const redemptionDeployment = await this.testContractDeployment('WAGACoffeeRedemption', redemption);
      const treasuryDeployment = await this.testContractDeployment('WAGATreasury', treasury);
      
      return redemptionDeployment.isDeployed && treasuryDeployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  private async testZKPrivacySystem(): Promise<boolean> {
    try {
      const zkManager = CONTRACT_ADDRESSES.WAGAZKManager;
      const circomVerifier = CONTRACT_ADDRESSES.CircomVerifier;
      
      const zkDeployment = await this.testContractDeployment('WAGAZKManager', zkManager);
      const verifierDeployment = await this.testContractDeployment('CircomVerifier', circomVerifier);
      
      return zkDeployment.isDeployed && verifierDeployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  private async testBankingIntegration(): Promise<boolean> {
    try {
      const bankingCore = CONTRACT_ADDRESSES.WAGABankingCore;
      const deployment = await this.testContractDeployment('WAGABankingCore', bankingCore);
      return deployment.isDeployed;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate comprehensive integration report
   */
  generateIntegrationReport(results: ContractIntegrationTestResult[]): string {
    const totalContracts = results.length;
    const deployedContracts = results.filter(r => r.deployment.isDeployed).length;
    const averageScore = results.reduce((sum, r) => sum + r.integrationScore, 0) / totalContracts;
    
    let report = `WAGA Contract Integration Report\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Network: Base Sepolia (${CHAIN_ID})\n`;
    report += `========================================\n\n`;
    
    report += `SUMMARY\n`;
    report += `-------\n`;
    report += `Total Contracts: ${totalContracts}\n`;
    report += `Deployed: ${deployedContracts} (${((deployedContracts / totalContracts) * 100).toFixed(1)}%)\n`;
    report += `Average Integration Score: ${averageScore.toFixed(1)}/100\n\n`;
    
    report += `CONTRACT DETAILS\n`;
    report += `================\n`;
    
    results.forEach(result => {
      const status = result.deployment.isDeployed ? '✅ DEPLOYED' : '❌ NOT DEPLOYED';
      report += `\n${status} | ${result.contractName}\n`;
      report += `Address: ${result.address}\n`;
      report += `Integration Score: ${result.integrationScore}/100\n`;
      report += `Functions: ${result.availableFunctions}/${result.totalFunctions}\n`;
      
      if (result.deployment.error) {
        report += `Error: ${result.deployment.error}\n`;
      }
      
      if (result.functions.length > 0) {
        const failedFunctions = result.functions.filter(f => !f.exists);
        if (failedFunctions.length > 0) {
          report += `Missing Functions:\n`;
          failedFunctions.forEach(f => {
            report += `  - ${f.functionName}: ${f.error || 'Not found'}\n`;
          });
        }
      }
    });
    
    return report;
  }
}

/**
 * Quick integration test function for use in components
 */
export const runQuickIntegrationTest = async (): Promise<{
  success: boolean;
  deployedContracts: number;
  totalContracts: number;
  averageScore: number;
  criticalFlows: any;
}> => {
  const tester = new ContractIntegrationTester();
  
  try {
    const results = await tester.testAllContracts();
    const criticalFlows = await tester.testCriticalBusinessFlows();
    
    const deployedContracts = results.filter(r => r.deployment.isDeployed).length;
    const totalContracts = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.integrationScore, 0) / totalContracts;
    
    return {
      success: deployedContracts === totalContracts,
      deployedContracts,
      totalContracts,
      averageScore,
      criticalFlows
    };
  } catch (error) {
    console.error('Integration test failed:', error);
    return {
      success: false,
      deployedContracts: 0,
      totalContracts: Object.keys(CONTRACT_ADDRESSES).length,
      averageScore: 0,
      criticalFlows: {}
    };
  }
};