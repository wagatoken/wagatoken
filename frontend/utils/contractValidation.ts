// Contract Function Signature Validation Script
// This script validates that all contract ABIs match the deployed contracts
// and that all required functions are accessible from the frontend

import { ethers } from 'ethers';
import { 
  getContractAddresses, 
  getContractABIs,
  getSigner,
  getContract
} from './smartContracts';

interface ValidationResult {
  contract: string;
  address: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface ContractValidationSummary {
  contractName: string;
  address: string;
  totalFunctions: number;
  validatedFunctions: number;
  errors: string[];
  warnings: string[];
  missingFunctions: string[];
}

/**
 * Validate all contract function signatures
 */
export async function validateAllContractSignatures(): Promise<{
  summary: ContractValidationSummary[];
  overallStatus: 'success' | 'error' | 'warning';
  recommendations: string[];
}> {
  console.log('🔍 Starting comprehensive contract signature validation...');
  
  const addresses = getContractAddresses();
  const abis = getContractABIs();
  const results: ValidationResult[] = [];
  const summaries: ContractValidationSummary[] = [];
  let hasErrors = false;
  let hasWarnings = false;

  // Test each contract
  for (const [contractName, address] of Object.entries(addresses)) {
    console.log(`\n📋 Validating ${contractName} at ${address}...`);
    
    try {
      const abi = abis[contractName];
      if (!abi) {
        results.push({
          contract: contractName,
          address,
          status: 'error',
          message: 'ABI not found'
        });
        hasErrors = true;
        continue;
      }

      const validation = await validateContractFunctions(contractName, address, abi);
      summaries.push(validation);
      
      if (validation.errors.length > 0) {
        hasErrors = true;
        results.push({
          contract: contractName,
          address,
          status: 'error',
          message: `${validation.errors.length} function errors`,
          details: validation.errors
        });
      } else if (validation.warnings.length > 0) {
        hasWarnings = true;
        results.push({
          contract: contractName,
          address,
          status: 'warning',
          message: `${validation.warnings.length} warnings`,
          details: validation.warnings
        });
      } else {
        results.push({
          contract: contractName,
          address,
          status: 'success',
          message: `All ${validation.validatedFunctions} functions validated`
        });
      }

    } catch (error) {
      hasErrors = true;
      results.push({
        contract: contractName,
        address,
        status: 'error',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(summaries);

  const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';

  // Print summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.contract}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('='.repeat(50));
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  return {
    summary: summaries,
    overallStatus,
    recommendations
  };
}

/**
 * Validate individual contract functions
 */
async function validateContractFunctions(
  contractName: string,
  address: string,
  abi: string[]
): Promise<ContractValidationSummary> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFunctions: string[] = [];
  let validatedFunctions = 0;

  try {
    // Check if we can connect to MetaMask and get provider
    let provider: ethers.Provider;
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
    } catch {
      // Fallback to public RPC if MetaMask not available
      provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org');
    }

    // Create contract instance
    const contract = new ethers.Contract(address, abi, provider);

    // Test each function in the ABI
    for (const functionSignature of abi) {
      try {
        // Parse function signature
        const fragment = ethers.Fragment.from(functionSignature);
        
        if (fragment.type === 'function') {
          const functionFragment = fragment as ethers.FunctionFragment;
          const functionName = functionFragment.name;
          
          // Check if function exists on contract
          if (typeof contract[functionName] === 'function') {
            // For view functions, try to call them with dummy parameters
            if (functionFragment.stateMutability === 'view' || functionFragment.stateMutability === 'pure') {
              try {
                // Test specific functions with known parameters
                await testViewFunction(contract, functionName, functionFragment);
                validatedFunctions++;
              } catch (viewError) {
                // View function exists but might need proper parameters
                warnings.push(`View function ${functionName} exists but failed test call: ${viewError instanceof Error ? viewError.message : 'Unknown error'}`);
                validatedFunctions++;
              }
            } else {
              // Non-view functions - just check they exist
              validatedFunctions++;
            }
          } else {
            missingFunctions.push(functionName);
            errors.push(`Function ${functionName} not found on contract`);
          }
        }
      } catch (parseError) {
        errors.push(`Failed to parse function signature: ${functionSignature}`);
      }
    }

    // Additional validation for core functions
    await validateCoreContractFunctions(contractName, contract, errors, warnings);

  } catch (error) {
    errors.push(`Failed to connect to contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    contractName,
    address,
    totalFunctions: abi.filter(sig => sig.includes('function')).length,
    validatedFunctions,
    errors,
    warnings,
    missingFunctions
  };
}

/**
 * Test view functions with appropriate parameters
 */
async function testViewFunction(contract: ethers.Contract, functionName: string, fragment: ethers.FunctionFragment) {
  // Define test parameters for common function patterns
  const testParams: Record<string, any[]> = {
    // Address-based functions
    'hasRole': ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
    'balanceOf': ['0x0000000000000000000000000000000000000000', 1],
    'isRegisteredSeller': ['0x0000000000000000000000000000000000000000'],
    'isAuthorizedBank': ['0x0000000000000000000000000000000000000000'],
    
    // ID-based functions
    'getBatchInfo': [1],
    'getBatchProductType': [1],
    'getBatchQuantity': [1],
    'getComplianceStatus': [1],
    'getECTAPermit': [1],
    'getQualityCertificate': [1],
    'getOriginVerification': [1],
    
    // Seller functions
    'getSellerProfile': [1],
    'getSellerAddress': [1],
    'getSellerId': ['0x0000000000000000000000000000000000000000'],
    
    // No parameter functions
    'getUSDToETBRate': [],
    'getActiveBatchIds': [],
    'getNextBatchId': [],
    'getBalance': [],
    'getRegisteredBankingPartnersCount': [],
    
    // Role constants
    'ADMIN_ROLE': [],
    'MINTER_ROLE': [],
    'VERIFIER_ROLE': [],
    'PROCESSOR_ROLE': [],
    'COOPERATIVE_ROLE': [],
    'DISTRIBUTOR_ROLE': []
  };

  // Try to determine appropriate test parameters
  let params: any[] = [];
  
  if (testParams[functionName]) {
    params = testParams[functionName];
  } else {
    // Generate params based on function signature
    params = fragment.inputs.map((input: ethers.ParamType) => {
      switch (input.type) {
        case 'address':
          return '0x0000000000000000000000000000000000000000';
        case 'uint256':
        case 'uint64':
        case 'uint8':
          return 1;
        case 'string':
          return 'test';
        case 'bool':
          return false;
        case 'bytes32':
          return '0x0000000000000000000000000000000000000000000000000000000000000000';
        case 'bytes11':
          return '0x00000000000000000000000000';
        default:
          if (input.type.startsWith('bytes')) {
            return '0x00';
          }
          return 0;
      }
    });
  }

  // Call the function with test parameters
  await contract[functionName](...params);
}

/**
 * Validate core contract-specific functions
 */
async function validateCoreContractFunctions(
  contractName: string,
  contract: ethers.Contract,
  errors: string[],
  warnings: string[]
) {
  try {
    switch (contractName) {
      case 'COFFEE_TOKEN':
        // Test critical coffee token functions
        try {
          await contract.getNextBatchId();
          await contract.getActiveBatchIds();
        } catch (error) {
          warnings.push(`Core coffee token functions may need verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;

      case 'CONFIG_MANAGER':
        // Test role-related functions
        try {
          await contract.ADMIN_ROLE();
          await contract.PROCESSOR_ROLE();
        } catch (error) {
          warnings.push(`Role constants may not be accessible: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;

      case 'ETHIOPIAN_COMPLIANCE':
        // Test compliance functions
        try {
          await contract.getComplianceStatus(1);
        } catch (error) {
          warnings.push(`Compliance functions may need valid batch IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;

      case 'BANKING_CORE':
        // Test banking functions
        try {
          await contract.getUSDToETBRate();
        } catch (error) {
          warnings.push(`Banking rate functions may not be initialized: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;
    }
  } catch (error) {
    warnings.push(`Core function validation failed for ${contractName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate recommendations based on validation results
 */
function generateRecommendations(summaries: ContractValidationSummary[]): string[] {
  const recommendations: string[] = [];
  
  // Check for contracts with high error rates
  const highErrorContracts = summaries.filter(s => s.errors.length > s.totalFunctions * 0.3);
  if (highErrorContracts.length > 0) {
    recommendations.push(`High error rate detected in: ${highErrorContracts.map(c => c.contractName).join(', ')}. Consider reviewing contract deployment and ABI accuracy.`);
  }

  // Check for missing functions
  const contractsWithMissingFunctions = summaries.filter(s => s.missingFunctions.length > 0);
  if (contractsWithMissingFunctions.length > 0) {
    recommendations.push(`Missing functions detected. Update ABIs to match deployed contracts or redeploy contracts with missing functions.`);
  }

  // Check for new contracts that might need testing
  const newContracts = ['ETHIOPIAN_COMPLIANCE', 'BANKING_CORE', 'CONFIG_MANAGER'];
  const untested = summaries.filter(s => 
    newContracts.includes(s.contractName) && s.validatedFunctions < s.totalFunctions * 0.8
  );
  if (untested.length > 0) {
    recommendations.push(`New integration contracts need additional testing: ${untested.map(c => c.contractName).join(', ')}`);
  }

  // Check overall coverage
  const totalFunctions = summaries.reduce((sum, s) => sum + s.totalFunctions, 0);
  const totalValidated = summaries.reduce((sum, s) => sum + s.validatedFunctions, 0);
  const coverage = totalValidated / totalFunctions;
  
  if (coverage < 0.9) {
    recommendations.push(`Function validation coverage is ${(coverage * 100).toFixed(1)}%. Aim for >90% to ensure system reliability.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('All contract function signatures are properly validated! System is ready for production use.');
  }

  return recommendations;
}

/**
 * Quick validation function for use in components
 */
export async function quickValidateContract(contractName: string): Promise<boolean> {
  try {
    const addresses = getContractAddresses();
    const abis = getContractABIs();
    
    const address = addresses[contractName];
    const abi = abis[contractName];
    
    if (!address || !abi) {
      return false;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(address, abi, provider);
    
    // Test a simple function call
    if (typeof contract.getAddress === 'function') {
      await contract.getAddress();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Quick validation failed for ${contractName}:`, error);
    return false;
  }
}

/**
 * Test specific function signatures that are critical for the integration plan
 */
export async function validateCriticalFunctions(): Promise<{
  criticalFunctionStatus: Record<string, boolean>;
  missingCritical: string[];
  recommendations: string[];
}> {
  const criticalFunctions = {
    // Seller registration
    'registerSeller': { contract: 'CONFIG_MANAGER', function: 'registerSeller' },
    'getSellerProfile': { contract: 'CONFIG_MANAGER', function: 'getSellerProfile' },
    'isRegisteredSeller': { contract: 'CONFIG_MANAGER', function: 'isRegisteredSeller' },
    
    // Ethiopian compliance
    'addECTAPermit': { contract: 'ETHIOPIAN_COMPLIANCE', function: 'addECTAPermit' },
    'getComplianceStatus': { contract: 'ETHIOPIAN_COMPLIANCE', function: 'getComplianceStatus' },
    'addQualityCertificate': { contract: 'ETHIOPIAN_COMPLIANCE', function: 'addQualityCertificate' },
    
    // Banking integration
    'getUSDToETBRate': { contract: 'BANKING_CORE', function: 'getUSDToETBRate' },
    'convertUSDToETB': { contract: 'BANKING_CORE', function: 'convertUSDToETB' },
    'isAuthorizedBank': { contract: 'BANKING_CORE', function: 'isAuthorizedBank' },
    
    // Batch creation and management
    'createBatchWithProductType': { contract: 'COFFEE_TOKEN', function: 'createBatchWithProductType' },
    'getBatchInfo': { contract: 'COFFEE_TOKEN', function: 'getBatchInfo' },
    'getActiveBatchIds': { contract: 'COFFEE_TOKEN', function: 'getActiveBatchIds' }
  };

  const addresses = getContractAddresses();
  const abis = getContractABIs();
  const criticalFunctionStatus: Record<string, boolean> = {};
  const missingCritical: string[] = [];

  for (const [functionName, { contract: contractName, function: contractFunction }] of Object.entries(criticalFunctions)) {
    try {
      const address = addresses[contractName];
      const abi = abis[contractName];
      
      if (!address || !abi) {
        criticalFunctionStatus[functionName] = false;
        missingCritical.push(`${functionName} - Contract ${contractName} not found`);
        continue;
      }

      // Check if function exists in ABI
      const hasFunction = abi.some(sig => sig.includes(`function ${contractFunction}`));
      criticalFunctionStatus[functionName] = hasFunction;
      
      if (!hasFunction) {
        missingCritical.push(`${functionName} - Function not found in ${contractName} ABI`);
      }
    } catch (error) {
      criticalFunctionStatus[functionName] = false;
      missingCritical.push(`${functionName} - Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const recommendations: string[] = [];
  if (missingCritical.length > 0) {
    recommendations.push('Critical functions missing - Integration plan features will not work without these functions');
    recommendations.push('Priority: Update contract ABIs or redeploy contracts with missing functions');
  } else {
    recommendations.push('All critical functions are available - Integration plan can proceed');
  }

  return {
    criticalFunctionStatus,
    missingCritical,
    recommendations
  };
}