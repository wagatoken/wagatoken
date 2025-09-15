"use client";

import { useState, useEffect } from 'react';
import { MdWarning, MdCheckCircle, MdError, MdStorage, MdLink, MdCloud, MdFlashOn } from 'react-icons/md';

interface EnvStatus {
  environment: {
    hasJWT: boolean;
    gatewayUrl: string;
    nodeEnv: string;
    platform: string;
  };
  pinataAuth?: {
    status: number;
    ok: boolean;
    authenticated?: boolean;
  };
  gatewayAccess?: {
    status: number;
    ok: boolean;
  };
  success: boolean;
}

interface ServiceStatus {
  ipfs: {
    connected: boolean;
    authenticated: boolean;
    gateway: boolean;
  };
  blockchain: {
    connected: boolean;
    network: string;
    contracts: boolean;
    contractDetails?: {
      core: number;
      management: number;
      financial: number;
      operational: number;
      zkVerifiers: number;
      total: number;
    };
    networkValid?: boolean;
    chainId?: number;
  };
  database: {
    connected: boolean;
    synced: boolean;
    tables: number;
  };
  chainlink: {
    available: boolean;
    subscriptionActive: boolean;
  };
}

export default function EnvironmentStatus() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateContractDeployment = (): { isValid: boolean; details: any } => {
    // Core contracts (2 expected)
    const coreContracts = [
      process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_CORE_ADDRESS,
      process.env.NEXT_PUBLIC_WAGA_COFFEE_VIEWS_ADDRESS
    ].filter(Boolean);
    
    // Management contracts (3 expected)
    const managementContracts = [
      process.env.NEXT_PUBLIC_WAGA_BATCH_MANAGER_ADDRESS,
      process.env.NEXT_PUBLIC_WAGA_ZK_MANAGER_ADDRESS,
      process.env.NEXT_PUBLIC_PRIVACY_LAYER_ADDRESS
    ].filter(Boolean);
    
    // Financial contracts (3 expected)
    const financialContracts = [
      process.env.NEXT_PUBLIC_WAGA_TREASURY_ADDRESS,
      process.env.NEXT_PUBLIC_WAGA_COFFEE_REDEMPTION_ADDRESS,
      process.env.NEXT_PUBLIC_WAGA_CDP_INTEGRATION_ADDRESS
    ].filter(Boolean);
    
    // Operational contracts (2 expected)
    const operationalContracts = [
      process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS,
      process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS
    ].filter(Boolean);
    
    // ZK Verifier contracts (4 expected)
    const zkVerifierContracts = [
      process.env.NEXT_PUBLIC_CIRCOM_VERIFIER_ADDRESS,
      process.env.NEXT_PUBLIC_PRICE_VERIFIER_ADDRESS,
      process.env.NEXT_PUBLIC_QUALITY_VERIFIER_ADDRESS,
      process.env.NEXT_PUBLIC_SUPPLY_CHAIN_VERIFIER_ADDRESS
    ].filter(Boolean);
    
    const details = {
      core: coreContracts.length,
      management: managementContracts.length,
      financial: financialContracts.length,
      operational: operationalContracts.length,
      zkVerifiers: zkVerifierContracts.length,
      total: coreContracts.length + managementContracts.length + financialContracts.length + operationalContracts.length + zkVerifierContracts.length
    };
    
    // Debug logging to see what's missing
    if (typeof window !== 'undefined') {
      console.log('Contract validation details:', {
        core: { expected: 2, found: coreContracts.length, contracts: coreContracts },
        management: { expected: 3, found: managementContracts.length, contracts: managementContracts },
        financial: { expected: 3, found: financialContracts.length, contracts: financialContracts },
        operational: { expected: 2, found: operationalContracts.length, contracts: operationalContracts },
        zkVerifiers: { expected: 4, found: zkVerifierContracts.length, contracts: zkVerifierContracts },
        total: `${details.total}/14`
      });
    }
    
    const isValid = details.total >= 14; // All 14 core contracts expected
    
    return { isValid, details };
  };

  useEffect(() => {
  const checkEnvironment = async () => {
    try {
      // Check IPFS status
      const ipfsResponse = await fetch('/api/debug/pinata');
      if (!ipfsResponse.ok) {
        throw new Error(`IPFS check failed: ${ipfsResponse.status}`);
      }
      const ipfsData = await ipfsResponse.json();
      setStatus(ipfsData);

      // Check wallet network if available
      let walletChainId: number | undefined;
      let isCorrectNetwork = false;
      
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          walletChainId = parseInt(chainId, 16);
          isCorrectNetwork = walletChainId === 84532; // Base Sepolia chain ID
        }
      } catch (walletError) {
        console.warn('Could not check wallet network:', walletError);
      }

      // Check all services status
      const contractValidation = validateContractDeployment();
      const servicesStatus: ServiceStatus = {
        ipfs: {
          connected: ipfsData.environment.hasJWT,
          authenticated: ipfsData.pinataAuth?.authenticated || false,
          gateway: ipfsData.gatewayAccess?.ok || false
        },
        blockchain: {
          connected: !!(process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_CORE_ADDRESS),
          network: 'Base Sepolia',
          contracts: contractValidation.isValid,
          contractDetails: contractValidation.details,
          networkValid: isCorrectNetwork,
          chainId: walletChainId
        },
        database: {
          connected: false,
          synced: false,
          tables: 0
        },
        chainlink: {
          available: !!(process.env.NEXT_PUBLIC_CHAINLINK_DON_ID),
          subscriptionActive: !!(process.env.NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID)
        }
      };        // Test database connection
        try {
          const dbResponse = await fetch('/api/test-db');
          if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            servicesStatus.database.connected = dbData.success;
            servicesStatus.database.tables = dbData.tables?.length || 0;
            servicesStatus.database.synced = servicesStatus.database.tables >= 6; // We expect 6 tables
          }
        } catch (dbError) {
          console.warn('Database status check failed:', dbError);
        }

        setServiceStatus(servicesStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <span className="text-yellow-800 text-sm">Checking system status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <MdError className="text-red-600 mr-2" size={20} />
          <span className="text-red-800 text-sm font-medium">System check failed: {error}</span>
        </div>
      </div>
    );
  }

  if (!status || !serviceStatus) return null;

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <MdCheckCircle className="text-green-600" size={16} />
    ) : (
      <MdError className="text-red-600" size={16} />
    );
  };

  const isHealthy = serviceStatus.ipfs.connected && 
                   serviceStatus.blockchain.connected && 
                   serviceStatus.database.connected;

  return (
    <div className="mb-6">
      {/* Overall Status Header */}
      <div className={`rounded-xl p-6 mb-4 transition-all duration-500 ${
        isHealthy 
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-emerald-100/50' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-amber-100/50'
      } shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isHealthy ? (
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                <MdCheckCircle className="text-emerald-600" size={24} />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                <MdWarning className="text-amber-600" size={24} />
              </div>
            )}
            <div>
              <h3 className={`text-lg font-semibold ${
                isHealthy ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                System Status
              </h3>
              <p className={`text-sm ${
                isHealthy ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {isHealthy ? 'All services operational' : 'Some services need attention'}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isHealthy 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {isHealthy ? '● Online' : '● Degraded'}
          </div>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IPFS Service */}
        <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <MdCloud className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="text-gray-900 font-medium">IPFS Storage</h4>
                <p className="text-gray-500 text-xs">Pinata Dedicated Gateway</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.ipfs.connected && serviceStatus.ipfs.authenticated && serviceStatus.ipfs.gateway
                ? 'bg-green-500 shadow-green-500/50 shadow-sm' 
                : serviceStatus.ipfs.connected
                ? 'bg-yellow-500 shadow-yellow-500/50 shadow-sm'
                : 'bg-red-500 shadow-red-500/50 shadow-sm'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">JWT Token</span>
              <span className={`font-medium ${
                serviceStatus.ipfs.connected ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.ipfs.connected ? 'Present' : 'Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Authentication</span>
              <span className={`font-medium ${
                serviceStatus.ipfs.authenticated ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.ipfs.authenticated ? 'Verified' : 'Failed'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Gateway</span>
              <span className={`font-medium ${
                serviceStatus.ipfs.gateway ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.ipfs.gateway ? 'Accessible' : 'Offline'}
              </span>
            </div>
            {status?.environment?.gatewayUrl && (
              <div className="text-xs text-gray-500 mt-2">
                Gateway: {status.environment.gatewayUrl}
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Service */}
        <div className="bg-white rounded-xl border border-purple-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MdLink className="text-purple-600" size={20} />
              </div>
              <div>
                <h4 className="text-gray-900 font-medium">Blockchain</h4>
                <p className="text-gray-500 text-xs">{serviceStatus.blockchain.network} (84532)</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.blockchain.connected && serviceStatus.blockchain.contracts && serviceStatus.blockchain.networkValid !== false
                ? 'bg-green-500 shadow-green-500/50 shadow-sm' 
                : serviceStatus.blockchain.connected && serviceStatus.blockchain.networkValid === false
                ? 'bg-yellow-500 shadow-yellow-500/50 shadow-sm'
                : 'bg-red-500 shadow-red-500/50 shadow-sm'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Configuration</span>
              <span className={`font-medium ${
                serviceStatus.blockchain.connected ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.blockchain.connected ? 'Ready' : 'Missing'}
              </span>
            </div>
            {serviceStatus.blockchain.chainId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Wallet Network</span>
                <span className={`font-medium ${
                  serviceStatus.blockchain.networkValid ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {serviceStatus.blockchain.networkValid ? 
                    'Base Sepolia ✓' : 
                    `Chain ${serviceStatus.blockchain.chainId} ⚠️`
                  }
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Contracts</span>
              <span className={`font-medium ${
                serviceStatus.blockchain.contracts ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.blockchain.contractDetails ? 
                  `${serviceStatus.blockchain.contractDetails.total}/14 Deployed` : 
                  'Not Deployed'
                }
              </span>
            </div>
            {serviceStatus.blockchain.contractDetails && (
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Core:</span> <span>{serviceStatus.blockchain.contractDetails.core}/2</span>
                </div>
                <div className="flex justify-between">
                  <span>Management:</span> <span>{serviceStatus.blockchain.contractDetails.management}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Financial:</span> <span>{serviceStatus.blockchain.contractDetails.financial}/3</span>
                </div>
                <div className="flex justify-between">
                  <span>Operational:</span> <span>{serviceStatus.blockchain.contractDetails.operational}/2</span>
                </div>
                <div className="flex justify-between">
                  <span>ZK Verifiers:</span> <span>{serviceStatus.blockchain.contractDetails.zkVerifiers}/4</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Database Service */}
        <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <MdStorage className="text-emerald-600" size={20} />
              </div>
              <div>
                <h4 className="text-gray-900 font-medium">Database</h4>
                <p className="text-gray-500 text-xs">PostgreSQL</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.database.connected && serviceStatus.database.synced
                ? 'bg-green-500 shadow-green-500/50 shadow-sm' 
                : serviceStatus.database.connected
                ? 'bg-yellow-500 shadow-yellow-500/50 shadow-sm'
                : 'bg-red-500 shadow-red-500/50 shadow-sm'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Connection</span>
              <span className={`font-medium ${
                serviceStatus.database.connected ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.database.connected ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Schema</span>
              <span className={`font-medium ${
                serviceStatus.database.synced ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {serviceStatus.database.tables}/6 tables
              </span>
            </div>
          </div>
        </div>

        {/* Chainlink Service */}
        <div className="bg-white rounded-xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <MdFlashOn className="text-orange-600" size={20} />
              </div>
              <div>
                <h4 className="text-gray-900 font-medium">Chainlink</h4>
                <p className="text-gray-500 text-xs">Functions & Oracles</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.chainlink.available && serviceStatus.chainlink.subscriptionActive
                ? 'bg-green-500 shadow-green-500/50 shadow-sm' 
                : serviceStatus.chainlink.available
                ? 'bg-yellow-500 shadow-yellow-500/50 shadow-sm'
                : 'bg-red-500 shadow-red-500/50 shadow-sm'
            }`} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Functions</span>
              <span className={`font-medium ${
                serviceStatus.chainlink.available ? 'text-green-700' : 'text-red-700'
              }`}>
                {serviceStatus.chainlink.available ? 'Available' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subscription</span>
              <span className={`font-medium ${
                serviceStatus.chainlink.subscriptionActive ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {serviceStatus.chainlink.subscriptionActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {!isHealthy && (
        <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full flex-shrink-0 mt-0.5">
              <MdWarning className="text-amber-600" size={16} />
            </div>
            <div>
              <h5 className="font-medium text-amber-900 mb-1">System Alerts</h5>
              <ul className="text-amber-800 text-sm space-y-1">
                {!serviceStatus.ipfs.connected && (
                  <li>• IPFS configuration required - check Pinata JWT token</li>
                )}
                {!serviceStatus.ipfs.authenticated && serviceStatus.ipfs.connected && (
                  <li>• IPFS authentication failed - verify Pinata credentials</li>
                )}
                {!serviceStatus.blockchain.connected && (
                  <li>• Core contract address missing - check NEXT_PUBLIC_WAGA_COFFEE_TOKEN_CORE_ADDRESS</li>
                )}
                {serviceStatus.blockchain.connected && !serviceStatus.blockchain.contracts && (
                  <li>• Incomplete smart contract deployment - {serviceStatus.blockchain.contractDetails?.total || 0}/14 contracts found</li>
                )}
                {serviceStatus.blockchain.chainId && !serviceStatus.blockchain.networkValid && (
                  <li>• Wrong network detected - switch to Base Sepolia (Chain ID: 84532)</li>
                )}
                {!serviceStatus.database.connected && (
                  <li>• Database connection unavailable - check NETLIFY_DATABASE_URL</li>
                )}
                {serviceStatus.database.connected && !serviceStatus.database.synced && (
                  <li>• Database schema incomplete ({serviceStatus.database.tables}/6 tables)</li>
                )}
                {!serviceStatus.chainlink.available && (
                  <li>• Chainlink DON ID not configured - check NEXT_PUBLIC_CHAINLINK_DON_ID</li>
                )}
                {!serviceStatus.chainlink.subscriptionActive && (
                  <li>• Chainlink subscription not configured - check NEXT_PUBLIC_CHAINLINK_SUBSCRIPTION_ID</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
