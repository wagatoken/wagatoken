"use client";

import { useState, useEffect } from "react";
import { TokenETH, WalletMetamask, NetworkEthereum } from "@web3icons/react";
import ZKConfigurationPanel, { ZKConfig } from "../../components/ZKConfigurationPanel";
import {
  MdCheck,
  MdClose,
  MdCoffee,
  MdVerified,
  MdCreate,
  MdAnalytics,
  MdLocationOn,
  MdGrade,
  MdStorage,
  MdStorefront,
  MdTimeline,
  MdDashboard,
  MdSettings,
  MdWarning,
  MdError,
  MdInfo,
  MdSecurity,
} from "react-icons/md";
import {
  generateCoffeeMetadata,
  BatchCreationData,
  validateBatchData,
  CoffeeBatchMetadata,
} from "@/utils/ipfsMetadata";
import {
  getBatchInfoWithMetadata,
  getActiveBatchIds,
  requestBatchVerification,
  createBatchBlockchainFirst,
  getUserRoles,
  grantUserRole,
  revokeUserRole,
  createPrivacyEnhancedBatch,
} from "@/utils/smartContracts";
import { 
  SystemFallbacks, 
  ZKFallbacks, 
  InventoryFallbacks, 
  checkSystemStatus, 
  SystemStatus 
} from "@/utils/systemFallbacks";
import {
  getInventoryStatistics,
  getCriticalBatches,
  getInventoryThresholds,
  setLowInventoryThreshold,
  setVerificationInterval,
  setMaxBatchesPerCheck,
  performPeriodicChecks
} from "@/utils/inventoryManager";
import EnvironmentStatus from "@/app/components/EnvironmentStatus";
import { useWallet } from "@/app/components/WalletProvider";
import PrivacyEnhancedBatchForm from "@/app/components/PrivacyEnhancedBatchForm";

interface BatchDisplay {
  batchId: string;
  name: string;
  origin: string;
  quantity: number;
  packagingInfo: string;
  pricePerUnit: string;
  isVerified: boolean;
  isMetadataVerified: boolean;
  metadata?: CoffeeBatchMetadata;
}

export default function AdminPage() {
  const { isConnected, address } = useWallet();
  
  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    blockchain: false,
    ipfs: false,
    database: false,
    chainlink: false
  });
  const [fallbackMode, setFallbackMode] = useState(false);

  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "manage" | "verify" | "inventory" | "analytics" | "settings">(
    "dashboard"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [batchCreationMode, setBatchCreationMode] = useState<'standard' | 'privacy-enhanced'>('standard');
  
  // Stats and inventory state
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    verifiedBatches: 0,
    totalSupply: 0,
    redemptionRate: 0
  });

  const [inventoryStats, setInventoryStats] = useState({
    totalBatches: 0,
    expiredBatches: 0,
    lowInventoryBatches: 0,
    batchesNeedingVerification: 0,
    totalInventoryValue: 0,
    averageBatchAge: 0
  });
  
  const [criticalBatches, setCriticalBatches] = useState({
    expiredBatches: [] as string[],
    lowInventoryBatches: [] as string[],
    verificationNeededBatches: [] as string[],
    expiringBatches: [] as string[]
  });
  
  const [inventoryThresholds, setInventoryThresholds] = useState({
    lowInventoryThreshold: 10,
    verificationInterval: 7 * 24 * 60 * 60, // 7 days in seconds
    maxBatchesPerCheck: 50
  });
  
  // QR Code state
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Role Management state
  const [roleManagement, setRoleManagement] = useState({
    selectedAddress: '',
    selectedRole: '',
    userRoles: {} as any,
    isLoadingRoles: false,
    roleChangeLoading: false
  });

  // Product types
  const PRODUCT_TYPES = {
    RETAIL_BAGS: {
      label: 'Retail Coffee Bags',
      sizes: ['250g', '500g'],
      description: 'Ready-to-consume ground coffee bags',
      requiresRole: 'ADMIN_ROLE'
    },
    GREEN_BEANS: {
      label: 'Green Coffee Beans',
      sizes: ['60kg'],
      description: 'Raw, unroasted coffee beans',
      requiresRole: 'COOPERATIVE_ROLE'
    },
    ROASTED_BEANS: {
      label: 'Roasted Coffee Beans',
      sizes: ['60kg'],
      description: 'Roasted coffee beans for further processing',
      requiresRole: 'ROASTER_ROLE'
    }
  };

  // Available roles for management
  const AVAILABLE_ROLES = {
    ADMIN_ROLE: {
      label: 'Admin',
      description: 'Full system administration privileges',
      category: 'Core'
    },
    COOPERATIVE_ROLE: {
      label: 'Cooperative',
      description: 'Create and manage green bean batches',
      category: 'Supply Chain'
    },
    PROCESSOR_ROLE: {
      label: 'Processor',
      description: 'Process green beans into retail products',
      category: 'Supply Chain'
    },
    ROASTER_ROLE: {
      label: 'Roaster',
      description: 'Roast green beans and create roasted bean batches',
      category: 'Supply Chain'
    },
    DISTRIBUTOR_ROLE: {
      label: 'Distributor',
      description: 'Distribute and sell coffee products',
      category: 'Supply Chain'
    },
    VERIFIER_ROLE: {
      label: 'Verifier',
      description: 'Verify batch quality and authenticity',
      category: 'Quality'
    },
    ZK_VERIFIER_ROLE: {
      label: 'ZK Verifier',
      description: 'Verify zero-knowledge proofs',
      category: 'Privacy'
    },
    MINTER_ROLE: {
      label: 'Minter',
      description: 'Mint new tokens for verified batches',
      category: 'Token'
    },
    FULFILLER_ROLE: {
      label: 'Fulfiller',
      description: 'Fulfill coffee redemption orders',
      category: 'Operations'
    },
    REDEMPTION_ROLE: {
      label: 'Redemption Manager',
      description: 'Manage coffee redemption processes',
      category: 'Operations'
    }
  };

  // Batch creation form with product type
  const [batchForm, setBatchForm] = useState<Partial<BatchCreationData & {
    productType: keyof typeof PRODUCT_TYPES;
    unitWeight: string;
    moistureContent?: number;
    density?: number;
    defectCount?: number;
    cooperativeId?: string;
    processorId?: string;
  }>>({
    name: '',
    description: '',
    origin: '',
    farmer: '',
    altitude: '',
    process: '',
    roastProfile: 'Medium',
    roastDate: new Date().toISOString().split('T')[0],
    certifications: [],
    cupping_notes: [],
    quantity: 0,
    packagingInfo: '250g',
    unitWeight: '250g',
    productType: 'RETAIL_BAGS',
    pricePerUnit: '0.045',
    productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago (past date)
    expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
  });

  // ZK Privacy Configuration State
  const [zkEnabled, setZkEnabled] = useState(false);
  const [zkConfig, setZkConfig] = useState({
    enablePricePrivacy: false,
    enableQualityPrivacy: false,
    enableSupplyChainPrivacy: false,
    pricingClaim: 'Competitive pricing verified',
    qualityClaim: 'Premium quality standards met',
    supplyChainClaim: 'Ethical supply chain verified'
  });

  // Check system status on component mount
  const checkAndSetSystemStatus = async () => {
    try {
      const status = await checkSystemStatus();
      setSystemStatus(status);
      setFallbackMode(!status.blockchain || !status.ipfs);
      
      if (!status.blockchain || !status.ipfs) {
        setError('⚠️ Running in fallback mode: Limited blockchain/IPFS connectivity');
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      setFallbackMode(true);
      setError('⚠️ Running in full fallback mode: All systems offline');
    }
  };

  // Load user roles for display
  const loadUserRoles = async (userAddress: string) => {
    if (!userAddress || !isConnected) return;
    
    setRoleManagement(prev => ({ ...prev, isLoadingRoles: true }));
    try {
      const roles = await getUserRoles(userAddress);
      setRoleManagement(prev => ({ 
        ...prev, 
        userRoles: roles,
        isLoadingRoles: false 
      }));
    } catch (error) {
      console.error('Error loading user roles:', error);
      setError('Failed to load user roles');
      setRoleManagement(prev => ({ ...prev, isLoadingRoles: false }));
    }
  };

  // Grant role to user
  const grantRole = async () => {
    if (!roleManagement.selectedAddress || !roleManagement.selectedRole) {
      setError('Please select both an address and a role');
      return;
    }

    setRoleManagement(prev => ({ ...prev, roleChangeLoading: true }));
    try {
      // Extract role name without '_ROLE' suffix
      const roleName = roleManagement.selectedRole.replace('_ROLE', '');
      
      const result = await grantUserRole(roleManagement.selectedAddress, roleName);
      if (result.success) {
        setSuccess(`Successfully granted ${AVAILABLE_ROLES[roleManagement.selectedRole as keyof typeof AVAILABLE_ROLES]?.label} role to ${roleManagement.selectedAddress}`);
        
        // Refresh user roles
        await loadUserRoles(roleManagement.selectedAddress);
      } else {
        setError(result.error || 'Failed to grant role');
      }
    } catch (error) {
      console.error('Error granting role:', error);
      setError('Failed to grant role. Please check your permissions.');
    } finally {
      setRoleManagement(prev => ({ ...prev, roleChangeLoading: false }));
    }
  };

  // Revoke role from user
  const revokeRole = async (role: string) => {
    if (!roleManagement.selectedAddress) {
      setError('Please select an address');
      return;
    }

    setRoleManagement(prev => ({ ...prev, roleChangeLoading: true }));
    try {
      // Extract role name without '_ROLE' suffix
      const roleName = role.replace('_ROLE', '');
      
      const result = await revokeUserRole(roleManagement.selectedAddress, roleName);
      if (result.success) {
        setSuccess(`Successfully revoked ${AVAILABLE_ROLES[role as keyof typeof AVAILABLE_ROLES]?.label} role from ${roleManagement.selectedAddress}`);
        
        // Refresh user roles
        await loadUserRoles(roleManagement.selectedAddress);
      } else {
        setError(result.error || 'Failed to revoke role');
      }
    } catch (error) {
      console.error('Error revoking role:', error);
      setError('Failed to revoke role. Please check your permissions.');
    } finally {
      setRoleManagement(prev => ({ ...prev, roleChangeLoading: false }));
    }
  };
  const loadBatches = async () => {
    if (!isConnected || !address) return;
    
    try {
      setLoading(true);
      setError('');

      // Try to get real batch data first
      try {
        const batchIds = await getActiveBatchIds();
        
        if (batchIds.length === 0) {
          setBatches([]);
          setStats({ totalBatches: 0, activeBatches: 0, verifiedBatches: 0, totalSupply: 0, redemptionRate: 0 });
          return;
        }

        const batchInfoPromises = batchIds.map(async (id) => {
          const batchInfo = await getBatchInfoWithMetadata(id);
          return {
            batchId: id,
            name: batchInfo.metadata?.name || `Batch ${id}`,
            origin: batchInfo.metadata?.properties?.origin || 'Unknown',
            quantity: batchInfo.quantity,
            packagingInfo: batchInfo.packagingInfo,
            pricePerUnit: (parseFloat(batchInfo.pricePerUnit) / 1e18).toFixed(4),
            isVerified: batchInfo.isVerified,
            isMetadataVerified: batchInfo.isMetadataVerified,
            metadata: batchInfo.metadata
          } as BatchDisplay;
        });
        
        const batchDisplays = await Promise.all(batchInfoPromises);
        setBatches(batchDisplays);
        
        // Update stats
        const verifiedCount = batchDisplays.filter(b => b.isVerified).length;
        const totalSupply = batchDisplays.reduce((sum, batch) => sum + batch.quantity, 0);
        
        setStats({
          totalBatches: batchDisplays.length,
          activeBatches: batchDisplays.length,
          verifiedBatches: verifiedCount,
          totalSupply,
          redemptionRate: verifiedCount > 0 ? Math.round((verifiedCount / batchDisplays.length) * 100) : 0
        });

      } catch (error) {
        console.warn('Real batch loading failed, using mock data:', error);
        
        // Use mock data
        const mockBatches = [
          {
            batchId: "1",
            name: "Ethiopian Yirgacheffe",
            origin: "Ethiopia",
            quantity: 100,
            packagingInfo: "250g",
            pricePerUnit: "0.05",
            isVerified: true,
            isMetadataVerified: true,
          },
          {
            batchId: "2", 
            name: "Ethiopian Sidamo",
            origin: "Ethiopia",
            quantity: 75,
            packagingInfo: "500g", 
            pricePerUnit: "0.08",
            isVerified: false,
            isMetadataVerified: true,
          }
        ] as BatchDisplay[];

        setBatches(mockBatches);
        setStats({
          totalBatches: 2,
          activeBatches: 2,
          verifiedBatches: 1,
          totalSupply: 175,
          redemptionRate: 50
        });
        
        setSuccess('✅ Data loaded in fallback mode');
      }

    } catch (err) {
      console.error('Error loading batches:', err);
      setError('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };



  // Handle form input changes
  const handleInputChange = (field: keyof BatchCreationData, value: any) => {
    setBatchForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleArrayInputChange = (field: 'certifications' | 'cupping_notes', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setBatchForm(prev => ({ ...prev, [field]: items }));
  };

  // Create batch 
  const createBatch = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate form
      const validationErrors = validateBatchData(batchForm);
      if (validationErrors.length > 0) {
        setError(`Validation errors: ${validationErrors.join(', ')}`);
        return;
      }

      // Try blockchain first, fall back to mock
      try {
        const batchData = {
          name: batchForm.name || 'Untitled Batch',
          description: batchForm.description || '',
          origin: batchForm.origin || '',
          farmer: batchForm.farmer || '',
          altitude: batchForm.altitude || '',
          process: batchForm.process || '',
          roastProfile: batchForm.roastProfile || 'Medium',
          roastDate: batchForm.roastDate || new Date().toISOString().split('T')[0],
          certifications: batchForm.certifications || [],
          cupping_notes: batchForm.cupping_notes || [],
          quantity: batchForm.quantity || 0,
          packagingInfo: batchForm.packagingInfo || '250g',
          pricePerUnit: batchForm.pricePerUnit || '0.045',
          productionDate: batchForm.productionDate || new Date(),
          expiryDate: batchForm.expiryDate || new Date(),
          productType: batchForm.productType,
          unitWeight: batchForm.unitWeight || batchForm.packagingInfo || '250g'
        };

        const result = await createBatchBlockchainFirst(
          batchData,
          zkEnabled ? zkConfig : undefined
        );

        setGeneratedQRs({
          comprehensive: result.qrCodeDataUrl,
          verification: result.verificationQR
        });
        
        // Enhanced success message with ZK info
        let successMessage = `✅ Batch created successfully! Batch ID: ${result.batchId}`;
        if (result.zkResults) {
          successMessage += `\n🔐 Privacy features enabled - ${result.zkResults.proofsGenerated.length} ZK proofs generated`;
        }
        setSuccess(successMessage);
      } catch (error) {
        console.warn('Blockchain creation failed, using mock mode:', error);
        
        // Mock creation
        const mockBatchId = `mock_${Date.now()}`;
        setGeneratedQRs({
          comprehensive: "data:image/png;base64,mock",
          verification: `https://verify.waga.coffee/batch/${mockBatchId}`
        });
        
        setSuccess(`✅ Batch created in demo mode! Batch ID: ${mockBatchId}`);
      }

      // Reset form and ZK config
      setBatchForm({
        name: '',
        description: '',
        origin: '',
        farmer: '',
        altitude: '',
        process: '',
        roastProfile: 'Medium',
        roastDate: new Date().toISOString().split('T')[0],
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: '250g',
        pricePerUnit: '0.045',
        productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
      });

      // Reset ZK configuration
      setZkEnabled(false);
      setZkConfig({
        enablePricePrivacy: false,
        enableQualityPrivacy: false,
        enableSupplyChainPrivacy: false,
        pricingClaim: 'Competitive pricing verified',
        qualityClaim: 'Premium quality standards met',
        supplyChainClaim: 'Ethical supply chain verified'
      });

      // Reload batches
      await loadBatches();

    } catch (err) {
      console.error('Error creating batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  // Handle privacy-enhanced batch creation
  const handlePrivacyEnhancedBatchCreation = async (data: any) => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to create privacy-enhanced batches');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('🔐 Creating privacy-enhanced admin batch...');
      console.log('   Data:', data);

      // Create privacy-enhanced batch using the integrated workflow
      const result = await createPrivacyEnhancedBatch(
        {
          // Map form data to expected format
          productionDate: new Date(data.productionDate),
          expiryDate: new Date(data.expiryDate),
          quantity: data.quantity,
          pricePerUnit: data.pricePerUnit.toString(),
          origin: data.origin,
          packagingInfo: data.packagingInfo,
          unitWeight: data.unitWeight,
          productType: data.productType || 'RETAIL_BAGS',
          cooperativeId: data.privacyConfig.sensitiveData.supplyChain?.cooperativeId,
          processorId: data.privacyConfig.sensitiveData.supplyChain?.processorId,
          name: `Admin Coffee - ${data.origin}`,
          description: `Privacy-enhanced coffee from ${data.origin}`,
          farmer: data.privacyConfig.sensitiveData.supplyChain?.farmerIdentity || 'Private',
          altitude: '1200-1800m', // Default altitude
          process: 'Washed', // Default processing method
          roastProfile: 'Medium', // Default roast profile
          roastDate: new Date().toISOString().split('T')[0], // Today as roast date
          certifications: data.privacyConfig.sensitiveData.supplyChain?.certificationDetails ? 
            [data.privacyConfig.sensitiveData.supplyChain.certificationDetails] : [],
          cupping_notes: data.privacyConfig.sensitiveData.quality?.gradingNotes ? 
            [data.privacyConfig.sensitiveData.quality.gradingNotes] : [],
          image: ''
        },
        data.privacyConfig
      );

      setSuccess(`Privacy-enhanced batch created successfully! Batch ID: ${result.batchId}`);
      console.log('✅ Privacy-enhanced admin batch created:', result);

      // Reset form mode to standard
      setBatchCreationMode('standard');

      // Reload batches
      await loadBatches();

    } catch (error) {
      console.error('❌ Error creating privacy-enhanced admin batch:', error);
      setError(error instanceof Error ? error.message : 'Failed to create privacy-enhanced batch');
    } finally {
      setLoading(false);
    }
  };

  // Verify batch 
  const verifyBatch = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!selectedBatch) {
        setError('Please select a batch to verify');
        return;
      }

      if (!address) {
        setError('Wallet not connected');
        return;
      }

      // Try real verification first, fall back to mock
      try {
        const requestId = await requestBatchVerification(selectedBatch);
        setSuccess(`✅ Verification request submitted successfully! Request ID: ${requestId}`);
      } catch (error) {
        console.warn('Real verification failed, using mock mode:', error);
        const mockRequestId = `mock_req_${Date.now()}`;
        setSuccess(`✅ Verification initiated in demo mode! Request ID: ${mockRequestId}`);
      }

      await loadBatches(); // Refresh batch list

    } catch (err) {
      console.error('Error verifying batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify batch');
    } finally {
      setLoading(false);
    }
  };

  // Initialize system status on mount
  useEffect(() => {
    checkAndSetSystemStatus();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      loadBatches();
    }
  }, [isConnected, address, systemStatus]);

  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-7xl mx-auto web3-page-spacing relative z-10">
        {/* Environment Status Check */}
        <EnvironmentStatus />
        
        {/* Header */}
        <div className="mb-12 animate-card-entrance">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float web3-cyber-glow flex justify-center">
              <MdSettings size={96} className="text-purple-600" />
            </div>
            <h1 className="text-5xl font-bold web3-gradient-text mb-4">
              WAGA Admin Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create coffee batches, upload to IPFS, verify with Chainlink Functions, 
              and generate QR codes for complete blockchain traceability
            </p>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="web3-stats-grid">
            <div className="web3-enhanced-stat-card web3-blockchain-pulse group">
              <div className="text-4xl font-bold web3-gradient-text mb-2">{batches.length}</div>
              <div className="text-gray-600 font-semibold">Total Batches</div>
              <div className="mt-2 text-sm text-emerald-600">
                {batches.filter(b => b.isVerified).length} verified
              </div>
            </div>
            <div className="web3-enhanced-stat-card web3-blockchain-pulse group" style={{ animationDelay: '100ms' }}>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {batches.filter(b => b.isVerified).length}
              </div>
              <div className="text-emerald-600 font-semibold">Verified Batches</div>
              <div className="mt-2 text-sm text-gray-600">
                {batches.length > 0 ? Math.round((batches.filter(b => b.isVerified).length / batches.length) * 100) : 0}% success rate
              </div>
            </div>
            <div className="web3-enhanced-stat-card web3-blockchain-pulse web3-coffee-particles group" style={{ animationDelay: '200ms' }}>
              <div className="flex justify-center mb-4 group-hover:animate-pulse">
                <MdCoffee size={48} className="text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-700 mb-2">
                {batches.reduce((sum, b) => sum + b.quantity, 0)}
              </div>
              <div className="text-emerald-700 font-semibold">Total Coffee Bags</div>
              <div className="mt-2 text-sm text-gray-600">
                Ready for distribution
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="web3-card text-center animate-card-entrance">
            <div className="mb-4">
              <div className="flex justify-center mb-3">
                <WalletMetamask size={48} variant="branded" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600 mb-4">
                Connect your wallet to access admin functions
              </p>
            </div>
          </div>
        )}

        {isConnected && address && (
          <>
            {/* Connected Wallet Info */}
            <div className="web3-card-wallet animate-card-entrance mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NetworkEthereum size={24} variant="branded" />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">Connected Wallet</h3>
                    <p className="text-emerald-700 font-mono text-sm">
                      {address.substring(0, 6)}...{address.substring(address.length - 4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
                    { id: 'create', label: 'Create Batch', icon: <MdCreate size={20} /> },
                    { id: 'manage', label: 'Manage Batches', icon: <MdTimeline size={20} /> },
                    { id: 'verify', label: 'Verify & Mint', icon: <MdVerified size={20} /> },
                    { id: 'inventory', label: 'Inventory', icon: <MdStorage size={20} /> },
                    { id: 'analytics', label: 'Analytics', icon: <MdAnalytics size={20} /> },
                    { id: 'settings', label: 'Settings', icon: <MdSettings size={20} /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="web3-card bg-red-50 border border-red-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdClose size={20} className="text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="web3-card bg-green-50 border border-green-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdCheck size={20} className="text-green-500" />
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* System Status */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MdSecurity size={24} className="text-purple-600" />
                    System Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Blockchain Status */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      systemStatus.blockchain 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <NetworkEthereum size={20} />
                        <span className="font-semibold">Blockchain</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemStatus.blockchain ? (
                          <>
                            <MdCheck size={16} className="text-green-600" />
                            <span className="text-sm">Base Sepolia Connected</span>
                          </>
                        ) : (
                          <>
                            <MdClose size={16} className="text-red-600" />
                            <span className="text-sm">Not Connected</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* IPFS Status */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      systemStatus.ipfs 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MdStorage size={20} />
                        <span className="font-semibold">IPFS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemStatus.ipfs ? (
                          <>
                            <MdCheck size={16} className="text-green-600" />
                            <span className="text-sm">Pinata Connected</span>
                          </>
                        ) : (
                          <>
                            <MdClose size={16} className="text-red-600" />
                            <span className="text-sm">Connection Failed</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Database Status */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      systemStatus.database 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MdStorage size={20} />
                        <span className="font-semibold">Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemStatus.database ? (
                          <>
                            <MdCheck size={16} className="text-green-600" />
                            <span className="text-sm">PostgreSQL Connected</span>
                          </>
                        ) : (
                          <>
                            <MdWarning size={16} className="text-red-600" />
                            <span className="text-sm">Using Mock Data</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chainlink Status */}
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      systemStatus.chainlink 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MdSecurity size={20} />
                        <span className="font-semibold">Chainlink</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {systemStatus.chainlink ? (
                          <>
                            <MdCheck size={16} className="text-green-600" />
                            <span className="text-sm">Functions Ready</span>
                          </>
                        ) : (
                          <>
                            <MdClose size={16} className="text-red-600" />
                            <span className="text-sm">Unavailable</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Overall Status */}
                  {systemStatus.overall && (
                    <div className={`p-4 rounded-lg border-2 ${
                      systemStatus.overall === 'healthy' 
                        ? 'bg-green-50 border-green-200' 
                        : systemStatus.overall === 'degraded'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {systemStatus.overall === 'healthy' && (
                          <>
                            <MdCheck size={20} className="text-green-600" />
                            <span className="font-semibold text-green-800">System Healthy</span>
                            <span className="text-green-700 ml-2">All services operational</span>
                          </>
                        )}
                        {systemStatus.overall === 'degraded' && (
                          <>
                            <MdWarning size={20} className="text-yellow-600" />
                            <span className="font-semibold text-yellow-800">System Degraded</span>
                            <span className="text-yellow-700 ml-2">Some services unavailable - using fallback modes</span>
                          </>
                        )}
                        {systemStatus.overall === 'critical' && (
                          <>
                            <MdError size={20} className="text-red-600" />
                            <span className="font-semibold text-red-800">System Critical</span>
                            <span className="text-red-700 ml-2">Multiple services down - limited functionality</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Setup Guide */}
                  {(!systemStatus.database || !systemStatus.ipfs) && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <MdInfo size={16} />
                        Setup Required
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        {!systemStatus.database && (
                          <p>• Database: Set NETLIFY_DATABASE_URL in environment variables</p>
                        )}
                        {!systemStatus.ipfs && (
                          <p>• IPFS: Verify PINATA_JWT is configured correctly</p>
                        )}
                        <p className="font-medium mt-2">
                          See <span className="font-mono">DATABASE_SETUP.md</span> for detailed setup instructions.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="web3-card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Total Batches</p>
                        <p className="text-3xl font-bold text-purple-900">{batches.length}</p>
                      </div>
                      <MdCoffee size={32} className="text-purple-500" />
                    </div>
                  </div>
                  <div className="web3-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Verified</p>
                        <p className="text-3xl font-bold text-green-900">{batches.filter(b => b.isVerified).length}</p>
                      </div>
                      <MdVerified size={32} className="text-green-500" />
                    </div>
                  </div>
                  <div className="web3-card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-blue-900">{batches.filter(b => !b.isVerified).length}</p>
                      </div>
                      <MdTimeline size={32} className="text-blue-500" />
                    </div>
                  </div>
                  <div className="web3-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-600 text-sm font-medium">Total Quantity</p>
                        <p className="text-3xl font-bold text-amber-900">{batches.reduce((sum, b) => sum + b.quantity, 0)}</p>
                      </div>
                      <MdStorage size={32} className="text-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="web3-card">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Batch Activity</h3>
                  {batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MdCoffee size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No batches created yet</p>
                      <p className="text-sm">Create your first coffee batch to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {batches.slice(0, 5).map((batch) => (
                        <div key={batch.batchId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <MdCoffee size={24} className="text-gray-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Batch #{batch.batchId}</h4>
                              <p className="text-sm text-gray-600">{batch.name} • {batch.origin}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              batch.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {batch.isVerified ? 'Verified' : 'Pending'}
                            </span>
                            <span className="text-sm text-gray-500">{batch.quantity} bags</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-8">
                {/* Batch Creation Mode Selector */}
                <div className="web3-card animate-card-entrance">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MdCreate size={24} />
                    Create Coffee Batch
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                      onClick={() => setBatchCreationMode('standard')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        batchCreationMode === 'standard'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <MdCreate size={32} className="mx-auto mb-3 text-purple-600" />
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Standard Creation</h3>
                      <p className="text-gray-600 text-sm">Create regular coffee batches with public metadata</p>
                    </button>
                    
                    <button
                      onClick={() => setBatchCreationMode('privacy-enhanced')}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        batchCreationMode === 'privacy-enhanced'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <MdSecurity size={32} className="mx-auto mb-3 text-purple-600" />
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">Privacy Enhanced</h3>
                      <p className="text-gray-600 text-sm">Create batches with encrypted sensitive data and ZK proofs</p>
                    </button>
                  </div>

                  {batchCreationMode === 'privacy-enhanced' ? (
                    <PrivacyEnhancedBatchForm
                      onSubmit={handlePrivacyEnhancedBatchCreation}
                      userRole="ADMIN"
                      isSubmitting={loading}
                    />
                  ) : (
                    /* Standard Traditional Form */
                    <div className="space-y-8">
                {/* Product Type Selection */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdCoffee size={20} />
                    Product Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(PRODUCT_TYPES).map(([key, product]) => (
                      <div
                        key={key}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                          batchForm.productType === key
                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setBatchForm(prev => ({
                            ...prev,
                            productType: key as keyof typeof PRODUCT_TYPES,
                            packagingInfo: product.sizes[0] as "250g" | "500g" | "60kg", // Set default size
                            unitWeight: product.sizes[0]
                          }));
                        }}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{product.label}</h4>
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map(size => (
                            <span key={size} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {size}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Requires: {product.requiresRole.replace('_ROLE', '').replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdLocationOn size={20} />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdCoffee size={16} />
                        Batch Name<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Sidama Coffee Batch #1001"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdLocationOn size={16} />
                        Origin/Region<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.origin || ''}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Sidama, Ethiopia"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdLocationOn size={16} />
                        Farmer/Cooperative<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.farmer || ''}
                        onChange={(e) => handleInputChange('farmer', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Abebe Bekele Cooperative"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Altitude (meters)
                      </label>
                      <input
                        type="text"
                        value={batchForm.altitude || ''}
                        onChange={(e) => handleInputChange('altitude', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 1,800-2,100m"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing & Production Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdCoffee size={20} />
                    Processing & Production
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label">
                        Processing Method
                      </label>
                      <input
                        type="text"
                        value={batchForm.process || ''}
                        onChange={(e) => handleInputChange('process', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Washed, Natural, Honey"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Roast Profile
                      </label>
                      <select
                        value={batchForm.roastProfile || 'Medium'}
                        onChange={(e) => handleInputChange('roastProfile', e.target.value)}
                        className="web3-ethereum-input w-full"
                      >
                        <option value="Light">Light Roast</option>
                        <option value="Medium-Light">Medium-Light Roast</option>
                        <option value="Medium">Medium Roast</option>
                        <option value="Medium-Dark">Medium-Dark Roast</option>
                        <option value="Dark">Dark Roast</option>
                      </select>
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Roast Date
                      </label>
                      <input
                        type="date"
                        value={batchForm.roastDate || ''}
                        onChange={(e) => handleInputChange('roastDate', e.target.value)}
                        className="web3-ethereum-input w-full"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Unit Size<span className="required">*</span>
                      </label>
                      <select
                        value={batchForm.packagingInfo || PRODUCT_TYPES[batchForm.productType || 'RETAIL_BAGS'].sizes[0]}
                        onChange={(e) => handleInputChange('packagingInfo', e.target.value as "250g" | "500g" | "60kg")}
                        className="web3-ethereum-input w-full"
                      >
                        {PRODUCT_TYPES[batchForm.productType || 'RETAIL_BAGS'].sizes.map(size => (
                          <option key={size} value={size}>
                            {size} {batchForm.productType === 'RETAIL_BAGS' ? 'Bags' : 'Batches'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quality & Certifications Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdGrade size={20} />
                    Quality & Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdGrade size={16} />
                        Certifications (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={batchForm.certifications?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdCoffee size={16} />
                        Cupping Notes (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={batchForm.cupping_notes?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange('cupping_notes', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Citrus, Chocolate, Floral, Bright acidity"
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory & Pricing Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdStorage size={20} />
                    Inventory & Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdStorage size={16} />
                        Quantity (bags)<span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        value={batchForm.quantity || ''}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 100"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <TokenETH size={16} variant="branded" />
                        Price per Unit (USD)<span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={batchForm.pricePerUnit || ''}
                        onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 25.00"
                        min="0.01"
                        max="500.00"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Enter price in USD (e.g., $25.00 for a coffee bag)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdTimeline size={20} />
                    Important Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label">
                        Production Date<span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={batchForm.productionDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleInputChange('productionDate', new Date(e.target.value))}
                        className="web3-ethereum-input w-full"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Expiry Date<span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={batchForm.expiryDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => handleInputChange('expiryDate', new Date(e.target.value))}
                        className="web3-ethereum-input w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="web3-form-section">
                  <h3>Description</h3>
                  <div>
                    <label className="web3-form-label">
                      📖 Batch Description<span className="required">*</span>
                    </label>
                    <textarea
                      value={batchForm.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="web3-ethereum-input w-full"
                      placeholder="Describe this coffee batch - origin story, flavor profile, processing details, and what makes it special..."
                    />
                  </div>
                </div>

                {/* ZK Privacy Configuration Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    🔐 Privacy Configuration
                  </h3>
                  <ZKConfigurationPanel
                    zkConfig={zkConfig}
                    onConfigChange={setZkConfig}
                    enabled={zkEnabled}
                    onEnabledChange={setZkEnabled}
                    className="mt-4"
                  />
                </div>

                <button
                  onClick={createBatch}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'web3-gradient-button hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Batch...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdCreate size={20} />
                      Create Batch & Generate QR Codes
                    </div>
                  )}
                </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdStorage size={24} />
                  Manage Coffee Batches
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>Loading batches...</p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No batches found. Create your first batch!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {batches.map((batch) => (
                      <div key={batch.batchId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <MdCoffee size={18} />
                              <h3 className="font-semibold text-lg">Batch #{batch.batchId}</h3>
                              <span className={`web3-status-indicator ${
                                batch.isVerified 
                                  ? 'web3-status-verified' 
                                  : 'web3-status-pending'
                              }`}>
                                {batch.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{batch.name}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Origin:</span> {batch.origin}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span> {batch.quantity} bags
                              </div>
                              <div>
                                <span className="font-medium">Package:</span> {batch.packagingInfo}
                              </div>
                              <div>
                                <span className="font-medium">Price:</span> {batch.pricePerUnit} ETH
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'verify' && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdVerified size={24} />
                  Verify Batches & Mint Tokens
                </h2>
                
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MdCoffee size={16} />
                    Select Batch to Verify
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a batch...</option>
                    {batches.filter(b => !b.isVerified).map((batch) => (
                      <option key={batch.batchId} value={batch.batchId}>
                        Batch #{batch.batchId} - {batch.name} ({batch.quantity} bags)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBatch && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                      <NetworkEthereum size={20} variant="branded" />
                      Verification Process
                    </h3>
                    <p className="text-blue-800 text-sm">
                      This will use Chainlink Functions to verify the batch data against external APIs, 
                      and automatically mint tokens to the distributor upon successful verification.
                    </p>
                  </div>
                )}

                <button
                  onClick={verifyBatch}
                  disabled={loading || !selectedBatch}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    loading || !selectedBatch
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'web3-gradient-button hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Verifying Batch...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdVerified size={20} />
                      Verify Batch & Mint Tokens
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Inventory Management Tab */}
            {activeTab === 'inventory' && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdStorage size={24} />
                  Inventory Management
                </h2>
                <p className="text-gray-600 mb-6">
                  Monitor and control periodic inventory verifications, configure automation parameters, 
                  and view verification history.
                </p>
                <div className="text-center">
                  <a 
                    href="/admin/inventory" 
                    className="web3-gradient-button inline-flex items-center gap-2 px-6 py-3 text-lg"
                  >
                    <MdStorage size={20} />
                    Open Inventory Dashboard
                  </a>
                </div>
              </div>
            )}

            {/* QR Codes Display */}
            {generatedQRs && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdTimeline size={24} />
                  Generated QR Codes
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Comprehensive Batch QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img 
                        src={generatedQRs.comprehensive} 
                        alt="Comprehensive Batch QR Code" 
                        className="mx-auto max-w-64"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Contains complete batch information, verification URL, and IPFS metadata
                    </p>
                    <button className="web3-gradient-button flex items-center gap-2 mx-auto">
                      <MdStorefront size={16} />
                      Download QR Code
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Simple Verification QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img 
                        src={generatedQRs.verification} 
                        alt="Verification QR Code" 
                        className="mx-auto max-w-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Simple verification URL for quick batch lookup
                    </p>
                    <button className="web3-gradient-button flex items-center gap-2 mx-auto">
                      <MdVerified size={16} />
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="web3-card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">System Analytics</h3>
                <p className="text-gray-600">Track batch creation trends, verification rates, and system performance metrics.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Role Management Section */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MdSettings size={24} />
                    Role Management
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Grant and revoke roles for cooperatives, processors, roasters, and other system participants.
                  </p>

                  {/* Address Selection */}
                  <div className="space-y-6">
                    <div>
                      <label className="web3-form-label">
                        User Address
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={roleManagement.selectedAddress}
                          onChange={(e) => setRoleManagement(prev => ({ 
                            ...prev, 
                            selectedAddress: e.target.value 
                          }))}
                          className="web3-ethereum-input flex-1"
                          placeholder="0x... (Ethereum address)"
                        />
                        <button
                          onClick={() => loadUserRoles(roleManagement.selectedAddress)}
                          disabled={!roleManagement.selectedAddress || roleManagement.isLoadingRoles}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {roleManagement.isLoadingRoles ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            'Load Roles'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Current Roles Display */}
                    {roleManagement.selectedAddress && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Current Roles</h4>
                        <div className="space-y-3">
                          {Object.entries(AVAILABLE_ROLES).map(([roleKey, roleInfo]) => {
                            const hasRole = roleManagement.userRoles[roleKey] || 
                                           roleManagement.userRoles[roleKey.toLowerCase().replace('_role', '')] ||
                                           false;
                            
                            return (
                              <div key={roleKey} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${
                                      hasRole ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></span>
                                    <div>
                                      <h5 className="font-medium text-gray-900">{roleInfo.label}</h5>
                                      <p className="text-sm text-gray-600">{roleInfo.description}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    hasRole 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {hasRole ? 'Active' : 'Inactive'}
                                  </span>
                                  {hasRole && (
                                    <button
                                      onClick={() => revokeRole(roleKey)}
                                      disabled={roleManagement.roleChangeLoading}
                                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Grant New Role */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Grant New Role</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="web3-form-label">
                            Select Role
                          </label>
                          <select
                            value={roleManagement.selectedRole}
                            onChange={(e) => setRoleManagement(prev => ({ 
                              ...prev, 
                              selectedRole: e.target.value 
                            }))}
                            className="web3-ethereum-input w-full"
                          >
                            <option value="">Choose a role...</option>
                            {Object.entries(AVAILABLE_ROLES).map(([roleKey, roleInfo]) => (
                              <option key={roleKey} value={roleKey}>
                                {roleInfo.label} - {roleInfo.category}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={grantRole}
                            disabled={!roleManagement.selectedAddress || !roleManagement.selectedRole || roleManagement.roleChangeLoading}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            {roleManagement.roleChangeLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </div>
                            ) : (
                              'Grant Role'
                            )}
                          </button>
                        </div>
                      </div>
                      {roleManagement.selectedRole && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Selected Role:</strong> {AVAILABLE_ROLES[roleManagement.selectedRole as keyof typeof AVAILABLE_ROLES]?.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Role Templates */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Setup Templates</h3>
                  <p className="text-gray-600 mb-4">
                    Quickly grant common role combinations for different user types.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 mb-2">Cooperative Setup</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Grant COOPERATIVE_ROLE for green bean batch creation
                      </p>
                      <button
                        onClick={() => setRoleManagement(prev => ({ 
                          ...prev, 
                          selectedRole: 'COOPERATIVE_ROLE' 
                        }))}
                        className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Select Cooperative Role
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 mb-2">Processor Setup</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Grant PROCESSOR_ROLE for retail coffee processing
                      </p>
                      <button
                        onClick={() => setRoleManagement(prev => ({ 
                          ...prev, 
                          selectedRole: 'PROCESSOR_ROLE' 
                        }))}
                        className="w-full px-3 py-2 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                      >
                        Select Processor Role
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-gray-900 mb-2">Roaster Setup</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Grant ROASTER_ROLE for roasted bean creation
                      </p>
                      <button
                        onClick={() => setRoleManagement(prev => ({ 
                          ...prev, 
                          selectedRole: 'ROASTER_ROLE' 
                        }))}
                        className="w-full px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        Select Roaster Role
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Settings */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">System Settings</h3>
                  <p className="text-gray-600">
                    Configure global system parameters and platform settings.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Additional system configuration options will be available here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
