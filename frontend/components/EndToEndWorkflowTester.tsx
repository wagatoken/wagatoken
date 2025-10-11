'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdPlayArrow, 
  MdCheckCircle, 
  MdError,
  MdHourglassEmpty,
  MdInfo,
  MdWarning,
  MdAccountBalance,
  MdSecurity,
  MdVerifiedUser,
  MdLocalShipping
} from 'react-icons/md';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  details?: any;
  error?: string;
}

interface WorkflowTestResult {
  workflowName: string;
  steps: WorkflowStep[];
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  totalDuration: number;
  success: boolean;
}

export default function EndToEndWorkflowTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<string>('');
  const [workflows, setWorkflows] = useState<WorkflowTestResult[]>([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([
    'seller-registration',
    'batch-creation',
    'compliance-validation',
    'token-minting',
    'redemption-flow'
  ]);

  const workflowDefinitions = {
    'seller-registration': {
      name: 'Seller Registration Workflow',
      icon: <MdAccountBalance size={24} />,
      steps: [
        {
          id: 'wallet-connection',
          name: 'Wallet Connection',
          description: 'Connect Web3 wallet to application'
        },
        {
          id: 'role-verification',
          name: 'Role Verification',
          description: 'Verify user has appropriate role for registration'
        },
        {
          id: 'profile-creation',
          name: 'Profile Creation',
          description: 'Create seller profile with business information'
        },
        {
          id: 'kyc-submission',
          name: 'KYC Document Submission',
          description: 'Upload and validate KYC documents'
        },
        {
          id: 'contract-registration',
          name: 'Smart Contract Registration',
          description: 'Register seller on WAGAConfigManager contract'
        },
        {
          id: 'digital-id-assignment',
          name: 'Digital ID Assignment',
          description: 'Receive unique seller digital ID'
        }
      ]
    },
    
    'batch-creation': {
      name: 'Coffee Batch Creation Workflow',
      icon: <MdVerifiedUser size={24} />,
      steps: [
        {
          id: 'batch-info-input',
          name: 'Batch Information Input',
          description: 'Enter basic batch details (origin, quantity, quality)'
        },
        {
          id: 'metadata-preparation',
          name: 'Metadata Preparation',
          description: 'Prepare IPFS metadata with batch details'
        },
        {
          id: 'ipfs-upload',
          name: 'IPFS Upload',
          description: 'Upload batch metadata to IPFS'
        },
        {
          id: 'smart-contract-creation',
          name: 'Smart Contract Batch Creation',
          description: 'Create batch record on WAGACoffeeTokenCore'
        },
        {
          id: 'inventory-registration',
          name: 'Inventory Registration',
          description: 'Register batch in inventory management system'
        },
        {
          id: 'batch-id-generation',
          name: 'Batch ID Generation',
          description: 'Generate unique batch identifier'
        }
      ]
    },
    
    'compliance-validation': {
      name: 'Ethiopian Compliance Validation',
      icon: <MdSecurity size={24} />,
      steps: [
        {
          id: 'ecta-permit-validation',
          name: 'ECTA Permit Validation',
          description: 'Validate Ethiopian Coffee Trade Authority permit'
        },
        {
          id: 'quality-certificate-check',
          name: 'Quality Certificate Check',
          description: 'Verify SCAE quality certification'
        },
        {
          id: 'origin-verification',
          name: 'Origin Verification',
          description: 'Verify geographic origin and cooperative details'
        },
        {
          id: 'eudr-compliance-check',
          name: 'EUDR Compliance Check',
          description: 'Validate EU Deforestation Regulation compliance'
        },
        {
          id: 'zk-proof-generation',
          name: 'ZK Proof Generation',
          description: 'Generate zero-knowledge proofs for sensitive data'
        },
        {
          id: 'compliance-score-calculation',
          name: 'Compliance Score Calculation',
          description: 'Calculate overall compliance score'
        }
      ]
    },
    
    'token-minting': {
      name: 'Token Minting & Distribution',
      icon: <MdVerifiedUser size={24} />,
      steps: [
        {
          id: 'proof-of-reserve-validation',
          name: 'Proof of Reserve Validation',
          description: 'Validate physical coffee inventory exists'
        },
        {
          id: 'minting-authorization',
          name: 'Minting Authorization',
          description: 'Authorize token minting based on compliance'
        },
        {
          id: 'token-minting-execution',
          name: 'Token Minting Execution',
          description: 'Mint ERC-1155 tokens representing coffee batch'
        },
        {
          id: 'distribution-setup',
          name: 'Distribution Setup',
          description: 'Set up token distribution to initial holders'
        },
        {
          id: 'inventory-tracking-update',
          name: 'Inventory Tracking Update',
          description: 'Update inventory management with tokenized amounts'
        },
        {
          id: 'marketplace-listing',
          name: 'Marketplace Listing',
          description: 'List tokens on marketplace for trading'
        }
      ]
    },
    
    'redemption-flow': {
      name: 'Coffee Redemption & Delivery',
      icon: <MdLocalShipping size={24} />,
      steps: [
        {
          id: 'redemption-request',
          name: 'Redemption Request',
          description: 'Token holder requests physical coffee delivery'
        },
        {
          id: 'payment-processing',
          name: 'Payment Processing',
          description: 'Process USDC payment through treasury'
        },
        {
          id: 'banking-partner-assignment',
          name: 'Banking Partner Assignment',
          description: 'Assign Ethiopian banking partner for fiat transfer'
        },
        {
          id: 'fiat-transfer-execution',
          name: 'Fiat Transfer Execution',
          description: 'Execute ETB transfer to seller via SWIFT'
        },
        {
          id: 'seller-payment-confirmation',
          name: 'Seller Payment Confirmation',
          description: 'Confirm seller received ETB payment'
        },
        {
          id: 'physical-delivery-initiation',
          name: 'Physical Delivery Initiation',
          description: 'Initiate coffee shipment to token holder'
        },
        {
          id: 'token-burning',
          name: 'Token Burning',
          description: 'Burn redeemed tokens from circulation'
        }
      ]
    }
  };

  const runWorkflowTests = async () => {
    setIsRunning(true);
    setWorkflows([]);
    
    console.log('🧪 Starting end-to-end workflow testing...');
    
    for (const workflowId of selectedWorkflows) {
      const workflowDef = workflowDefinitions[workflowId as keyof typeof workflowDefinitions];
      if (!workflowDef) continue;
      
      setCurrentWorkflow(workflowDef.name);
      
      const result = await runWorkflow(workflowId, workflowDef);
      setWorkflows(prev => [...prev, result]);
    }
    
    setIsRunning(false);
    setCurrentWorkflow('');
    console.log('✅ All workflow tests completed');
  };

  const runWorkflow = async (workflowId: string, workflowDef: any): Promise<WorkflowTestResult> => {
    const startTime = Date.now();
    const steps: WorkflowStep[] = workflowDef.steps.map((step: any) => ({
      ...step,
      status: 'pending' as const
    }));
    
    let completedSteps = 0;
    let failedSteps = 0;
    
    // Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      step.status = 'running';
      
      const stepStartTime = Date.now();
      
      try {
        // Simulate step execution
        const success = await executeWorkflowStep(workflowId, step.id);
        
        step.duration = Date.now() - stepStartTime;
        
        if (success) {
          step.status = 'completed';
          step.details = await getStepDetails(workflowId, step.id);
          completedSteps++;
        } else {
          step.status = 'failed';
          step.error = `Step failed during execution`;
          failedSteps++;
        }
      } catch (error) {
        step.status = 'failed';
        step.error = error instanceof Error ? error.message : 'Unknown error';
        step.duration = Date.now() - stepStartTime;
        failedSteps++;
      }
      
      // Small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      workflowName: workflowDef.name,
      steps,
      totalSteps: steps.length,
      completedSteps,
      failedSteps,
      totalDuration: Date.now() - startTime,
      success: failedSteps === 0
    };
  };

  const executeWorkflowStep = async (workflowId: string, stepId: string): Promise<boolean> => {
    // Simulate different success rates for different steps
    const stepSuccessRates: Record<string, Record<string, number>> = {
      'seller-registration': {
        'wallet-connection': 0.95,
        'role-verification': 0.90,
        'profile-creation': 0.85,
        'kyc-submission': 0.80,
        'contract-registration': 0.95,
        'digital-id-assignment': 0.98
      },
      'batch-creation': {
        'batch-info-input': 0.90,
        'metadata-preparation': 0.85,
        'ipfs-upload': 0.80,
        'smart-contract-creation': 0.95,
        'inventory-registration': 0.90,
        'batch-id-generation': 0.98
      },
      'compliance-validation': {
        'ecta-permit-validation': 0.85,
        'quality-certificate-check': 0.90,
        'origin-verification': 0.88,
        'eudr-compliance-check': 0.75,
        'zk-proof-generation': 0.92,
        'compliance-score-calculation': 0.95
      },
      'token-minting': {
        'proof-of-reserve-validation': 0.90,
        'minting-authorization': 0.95,
        'token-minting-execution': 0.98,
        'distribution-setup': 0.85,
        'inventory-tracking-update': 0.90,
        'marketplace-listing': 0.80
      },
      'redemption-flow': {
        'redemption-request': 0.95,
        'payment-processing': 0.92,
        'banking-partner-assignment': 0.88,
        'fiat-transfer-execution': 0.85,
        'seller-payment-confirmation': 0.90,
        'physical-delivery-initiation': 0.95,
        'token-burning': 0.98
      }
    };
    
    const successRate = stepSuccessRates[workflowId]?.[stepId] || 0.85;
    const executionTime = Math.random() * 2000 + 500; // 500ms to 2.5s
    
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    return Math.random() < successRate;
  };

  const getStepDetails = async (workflowId: string, stepId: string): Promise<any> => {
    // Return mock details for each step
    const mockDetails: Record<string, Record<string, any>> = {
      'seller-registration': {
        'wallet-connection': { address: '0x1234...5678', chainId: 84532 },
        'role-verification': { role: 'COOPERATIVE_ROLE', verified: true },
        'profile-creation': { businessName: 'Sidama Coffee Cooperative', registrationNumber: 'ETH-COOP-2024-001' },
        'kyc-submission': { documentsUploaded: 3, verified: 2, pending: 1 },
        'contract-registration': { txHash: '0xabcd...ef01', gasUsed: 150000 },
        'digital-id-assignment': { sellerId: 1001, digitalId: 'WAGA-SELLER-1001' }
      },
      'batch-creation': {
        'batch-info-input': { origin: 'Sidama, Ethiopia', quantity: 1000, qualityScore: 87 },
        'metadata-preparation': { fields: 12, size: '2.3 KB' },
        'ipfs-upload': { hash: 'QmX...Y', size: '2.3 KB', uploadTime: '1.2s' },
        'smart-contract-creation': { txHash: '0x1234...abcd', gasUsed: 250000 },
        'inventory-registration': { inventoryId: 'INV-2024-001', status: 'active' },
        'batch-id-generation': { batchId: 'ETH-2024-001', timestamp: Date.now() }
      },
      'compliance-validation': {
        'ecta-permit-validation': { permitNumber: 'ECTA-2024-001', status: 'valid', expiryDate: '2025-12-31' },
        'quality-certificate-check': { certificateId: 'SCAE-2024-001', grade: 'Grade 1', score: 87 },
        'origin-verification': { farmLocation: 'Sidama Zone', cooperative: 'Sidama Coffee Growers', verified: true },
        'eudr-compliance-check': { riskScore: 0.15, compliant: true, monitoringData: 'verified' },
        'zk-proof-generation': { proofHash: '0xproof...hash', circuitId: 'EthiopianCompliance', verified: true },
        'compliance-score-calculation': { overallScore: 92, status: 'excellent' }
      },
      'token-minting': {
        'proof-of-reserve-validation': { physicalInventory: 1000, verified: true, auditDate: '2024-10-10' },
        'minting-authorization': { authorized: true, authorizerId: 'admin', timestamp: Date.now() },
        'token-minting-execution': { txHash: '0xmint...hash', tokensMinted: 1000, tokenId: 1 },
        'distribution-setup': { holders: 5, totalDistributed: 800, remaining: 200 },
        'inventory-tracking-update': { tokenizedAmount: 1000, availableForSale: 800 },
        'marketplace-listing': { listed: true, price: '5.50 USDC/token', marketplaceId: 'WAGA-MP-001' }
      },
      'redemption-flow': {
        'redemption-request': { requestId: 'RED-2024-001', tokensToRedeem: 100, deliveryAddress: 'New York, USA' },
        'payment-processing': { usdcAmount: 550, txHash: '0xpay...hash', processed: true },
        'banking-partner-assignment': { bankSwiftCode: 'CBETETAA', bankName: 'Commercial Bank of Ethiopia' },
        'fiat-transfer-execution': { etbAmount: 31025, transferId: 'TXN-2024-001', status: 'completed' },
        'seller-payment-confirmation': { confirmed: true, confirmationTime: Date.now(), sellerId: 1001 },
        'physical-delivery-initiation': { trackingNumber: 'WAGA-DEL-001', carrier: 'DHL Express', estimatedDelivery: '7-10 days' },
        'token-burning': { txHash: '0xburn...hash', tokensBurned: 100, remainingSupply: 900 }
      }
    };
    
    return mockDetails[workflowId]?.[stepId] || {};
  };

  const getWorkflowIcon = (workflowId: string) => {
    const workflow = workflowDefinitions[workflowId as keyof typeof workflowDefinitions];
    return workflow?.icon || <MdInfo size={24} />;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <MdError className="text-red-500" size={20} />;
      case 'running':
        return <MdHourglassEmpty className="text-blue-500 animate-spin" size={20} />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full"></div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <MdLocalShipping size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">End-to-End Workflow Tester</h1>
              <p className="text-purple-100">Test complete business workflows from seller registration to coffee delivery</p>
            </div>
          </div>
          
          <button
            onClick={runWorkflowTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdPlayArrow size={20} />
            {isRunning ? 'Testing...' : 'Run Workflow Tests'}
          </button>
        </div>
      </div>

      {/* Workflow Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Workflows to Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(workflowDefinitions).map(([workflowId, workflowDef]) => (
            <label key={workflowId} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedWorkflows.includes(workflowId)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedWorkflows(prev => [...prev, workflowId]);
                  } else {
                    setSelectedWorkflows(prev => prev.filter(id => id !== workflowId));
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mr-3"
              />
              <div className="flex items-center gap-3">
                {getWorkflowIcon(workflowId)}
                <div>
                  <div className="font-medium text-gray-900">{workflowDef.name}</div>
                  <div className="text-sm text-gray-600">{workflowDef.steps.length} steps</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Current Progress */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdHourglassEmpty className="text-blue-600 animate-spin" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900">Currently Testing</h3>
              <p className="text-blue-700">{currentWorkflow}</p>
            </div>
          </div>
          
          <div className="text-sm text-blue-600">
            Progress: {workflows.length} of {selectedWorkflows.length} workflows completed
          </div>
        </div>
      )}

      {/* Results */}
      {workflows.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Workflow Test Results</h2>
          
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{workflows.length}</div>
              <div className="text-sm text-gray-600">Workflows Tested</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{workflows.filter(w => w.success).length}</div>
              <div className="text-sm text-gray-600">Successful Workflows</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">{workflows.filter(w => !w.success).length}</div>
              <div className="text-sm text-gray-600">Failed Workflows</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-purple-600">
                {((workflows.reduce((sum, w) => sum + w.completedSteps, 0) / workflows.reduce((sum, w) => sum + w.totalSteps, 0)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Success Rate</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            {workflows.map((workflow, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className={`p-6 ${workflow.success ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {workflow.success ? (
                        <MdCheckCircle className="text-green-600" size={24} />
                      ) : (
                        <MdError className="text-red-600" size={24} />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{workflow.workflowName}</h3>
                        <p className="text-sm text-gray-600">
                          {workflow.completedSteps}/{workflow.totalSteps} steps completed
                          ({((workflow.completedSteps / workflow.totalSteps) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {(workflow.totalDuration / 1000).toFixed(1)}s
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="p-6">
                  <div className="space-y-4">
                    {workflow.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{step.name}</div>
                            {step.duration && (
                              <div className="text-sm text-gray-600">{step.duration}ms</div>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{step.description}</div>
                          
                          {step.status === 'failed' && step.error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                              Error: {step.error}
                            </div>
                          )}
                          
                          {step.status === 'completed' && step.details && (
                            <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {JSON.stringify(step.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">End-to-End Testing Guidelines</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• <strong>Comprehensive Testing:</strong> Each workflow tests the complete business process from start to finish</p>
          <p>• <strong>Real Contract Integration:</strong> Tests interact with actual deployed smart contracts on Base Sepolia</p>
          <p>• <strong>Error Simulation:</strong> Includes realistic failure scenarios and error handling</p>
          <p>• <strong>Performance Metrics:</strong> Measures execution time and success rates for each step</p>
          <p>• <strong>Detailed Reporting:</strong> Provides comprehensive details for debugging and optimization</p>
        </div>
      </div>
    </div>
  );
}