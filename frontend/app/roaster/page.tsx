'use client';

import { useEffect, useState } from 'react';
// import { useAccount } from 'wagmi';
import { MdDashboard, MdLocalFireDepartment, MdInventory, MdAnalytics, MdSettings, MdAdd, MdSearch, MdFilterList, MdFileDownload, MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdStore, MdSecurity } from 'react-icons/md';
import { ethers } from 'ethers';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR, CoffeeBatchMetadata } from '../../utils/ipfsMetadata';
import ZKConfigurationPanel, { ZKConfig } from '../../components/ZKConfigurationPanel';
import PrivacyEnhancedBatchForm from '../components/PrivacyEnhancedBatchForm';

const DISABLE_AUTH_FOR_TESTING = true; // Set to false to re-enable authentication

// Batch creation data type for roasters
interface RoasterBatchData {
  name: string;
  description: string;
  origin: string;
  farmer: string;
  altitude: string;
  process: string;
  certifications: string[];
  cupping_notes: string[];
  quantity: number;
  packagingInfo: "250g" | "500g" | "60kg";
  unitWeight: string; // 60kg
  pricePerUnit: string;
  productionDate: Date;
  expiryDate: Date;
  image?: string;

  // Roasted bean specific fields
  roastProfile: string;
  roastDate: string;
  roastDegree: string;
  processorId: string;
  processorName: string;
  location: string;
  roastMethod: string;
}

export default function RoasterPortal() {
  // const { isConnected, address } = useAccount();
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [batchCreationMode, setBatchCreationMode] = useState<'standard' | 'privacy-enhanced'>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRoasterRole, setHasRoasterRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Batch creation form
  const [batchForm, setBatchForm] = useState<RoasterBatchData>({
    name: '',
    description: '',
    origin: '',
    farmer: '',
    altitude: '',
    process: 'Washed',
    certifications: [],
    cupping_notes: [],
    quantity: 0,
    packagingInfo: '60kg' as "250g" | "500g" | "60kg",
    unitWeight: '60kg',
    pricePerUnit: '4.50',
    productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago (roast date)
    expiryDate: new Date(Date.now() + (120 * 24 * 60 * 60 * 1000)), // 4 months from now

    // Roasted bean specific fields
    roastProfile: 'Medium',
    roastDate: new Date().toISOString().split('T')[0],
    roastDegree: 'Medium',
    processorId: '',
    processorName: '',
    location: '',
    roastMethod: 'Drum',
  });

  // ZK Privacy Configuration State
  const [zkEnabled, setZkEnabled] = useState(false);
  const [zkConfig, setZkConfig] = useState({
    enablePricePrivacy: false,
    enableQualityPrivacy: false,
    enableSupplyChainPrivacy: false,
    pricingClaim: 'Premium roasted bean pricing verified',
    qualityClaim: 'Artisan roasting quality standards met',
    supplyChainClaim: 'Transparent roaster supply chain verified'
  });

  // Generated QR codes
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'roast', label: 'Roasting', icon: MdLocalFireDepartment },
    { id: 'inventory', label: 'Inventory', icon: MdInventory },
    { id: 'qr-codes', label: 'QR Codes', icon: MdQrCode },
    { id: 'analytics', label: 'Analytics', icon: MdAnalytics },
    { id: 'settings', label: 'Settings', icon: MdSettings },
  ];

  // Check roaster role on component mount
  useEffect(() => {
    if (!DISABLE_AUTH_FOR_TESTING) {
      checkRoasterRole();
    } else {
      setRoleChecking(false);
      setHasRoasterRole(true);
    }
  }, [address, isConnected]);

  const checkRoasterRole = async () => {
    if (!address || !isConnected) {
      setRoleChecking(false);
      return;
    }

    try {
      setRoleChecking(true);
      // Import contract utilities
      const { getContract, getSigner, COFFEE_TOKEN_ABI } = await import('../../utils/smartContracts');
      const coffeeTokenAddress = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS;

      if (!coffeeTokenAddress) {
        throw new Error('Coffee token address not configured');
      }

      const signer = await getSigner();
      const coffeeTokenContract = getContract(coffeeTokenAddress, COFFEE_TOKEN_ABI, signer);

      // Check if user has ROASTER_ROLE
      const roasterRole = await coffeeTokenContract.ROASTER_ROLE();
      const hasRole = await coffeeTokenContract.hasRole(roasterRole, address);

      setHasRoasterRole(hasRole);
    } catch (error) {
      console.error('Error checking roaster role:', error);
      setError('Failed to verify roaster permissions');
    } finally {
      setRoleChecking(false);
    }
  };

  const handleInputChange = (field: keyof RoasterBatchData, value: any) => {
    setBatchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'certifications' | 'cupping_notes', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setBatchForm(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!batchForm.name.trim()) errors.push('Batch name is required');
    if (!batchForm.origin.trim()) errors.push('Origin is required');
    if (!batchForm.farmer.trim()) errors.push('Farmer information is required');
    if (!batchForm.processorName.trim()) errors.push('Processor name is required');
    if (!batchForm.location.trim()) errors.push('Location is required');
    if (!batchForm.processorId.trim()) errors.push('Processor Ethereum address is required');
    if (batchForm.quantity <= 0) errors.push('Quantity must be greater than 0');
    if (!batchForm.packagingInfo) errors.push('Packaging information is required');
    if (parseFloat(batchForm.pricePerUnit) <= 0) errors.push('Price per unit must be greater than 0');
    if (!batchForm.roastProfile) errors.push('Roast profile is required');
    if (!batchForm.roastDate) errors.push('Roast date is required');

    const now = new Date();
    if (batchForm.productionDate > now) errors.push('Production date cannot be in the future');
    if (batchForm.expiryDate <= batchForm.productionDate) errors.push('Expiry date must be after production date');

    return errors;
  };

  const handleCreateBatch = async () => {
    if (!isConnected || !hasRoasterRole) {
      setError('Please connect your wallet and ensure you have roaster permissions');
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(`Validation errors: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create batch using blockchain-first workflow with ZK configuration
      const result = await createBatchBlockchainFirst({
        ...batchForm,
        productType: 'ROASTED_BEANS', // Roasters create roasted beans
        processorId: batchForm.processorId
      }, zkEnabled ? zkConfig : undefined);

      // Enhanced success message with ZK info
      let successMessage = `Roasted bean batch created successfully! Batch ID: ${result.batchId}`;
      if (result.zkResults) {
        successMessage += ` - Privacy features enabled (${result.zkResults.proofsGenerated.length} ZK proofs)`;
      }
      setSuccess(successMessage);

      // Generate QR codes
      console.log('Generating QR codes...');
      const metadata: CoffeeBatchMetadata = {
        name: batchForm.name,
        description: batchForm.description,
        image: batchForm.image,
        properties: {
          origin: batchForm.origin,
          farmer: batchForm.farmer,
          altitude: batchForm.altitude,
          process: batchForm.process,
          roastProfile: batchForm.roastProfile || '',
          roastDate: batchForm.roastDate || '',
          certifications: batchForm.certifications,
          cupping_notes: batchForm.cupping_notes,
          batchSize: batchForm.quantity,
          packagingInfo: batchForm.packagingInfo,
          pricePerUnit: batchForm.pricePerUnit
        }
      };
      const qrCodeDataUrl = await generateBatchQRCode(result.batchId, metadata, result.ipfsUri);
      const verificationQR = await generateSimpleVerificationQR(result.batchId);

      setGeneratedQRs({
        comprehensive: qrCodeDataUrl,
        verification: verificationQR
      });

      // Reset form and ZK config
      setBatchForm({
        name: '',
        description: '',
        origin: '',
        farmer: '',
        altitude: '',
        process: 'Washed',
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: '60kg' as "250g" | "500g" | "60kg",
        unitWeight: '60kg',
        pricePerUnit: '4.50',
        productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        expiryDate: new Date(Date.now() + (120 * 24 * 60 * 60 * 1000)),

        // Roasted bean specific fields
        roastProfile: 'Medium',
        roastDate: new Date().toISOString().split('T')[0],
        roastDegree: 'Medium',
        processorId: '',
        processorName: '',
        location: '',
        roastMethod: 'Drum',
      });

      // Reset ZK configuration
      setZkEnabled(false);
      setZkConfig({
        enablePricePrivacy: false,
        enableQualityPrivacy: false,
        enableSupplyChainPrivacy: false,
        pricingClaim: 'Premium roasted bean pricing verified',
        qualityClaim: 'Artisan roasting quality standards met',
        supplyChainClaim: 'Transparent roaster supply chain verified'
      });

    } catch (error) {
      console.error('Error creating batch:', error);
      setError(error instanceof Error ? error.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyEnhancedBatchCreation = async (data: any) => {
    if (!isConnected || !hasRoasterRole) {
      setError('Please connect your wallet and ensure you have roaster permissions');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Import the privacy-enhanced function
      const { createPrivacyEnhancedBatch } = await import('../../utils/smartContracts');

      console.log('🔐 Creating privacy-enhanced roaster batch...');
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
          productType: 'ROASTED_BEANS', // Roasters create roasted beans
          processorId: `roaster_${address}`, // Generate roaster ID
          name: `Roasted Beans - ${data.origin}`,
          description: `Privacy-enhanced roasted beans from ${data.origin}`,
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

      setSuccess(`Privacy-enhanced roasted batch created successfully! Batch ID: ${result.batchId}`);
      console.log('✅ Privacy-enhanced roaster batch created:', result);

      // Reset form mode to standard
      setBatchCreationMode('standard');

    } catch (error) {
      console.error('❌ Error creating privacy-enhanced roaster batch:', error);
      setError(error instanceof Error ? error.message : 'Failed to create privacy-enhanced batch');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBatch = (batch: any) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  // QR Code generation for roasted batches
  const generateQRCodes = async () => {
    if (!selectedBatch) {
      setError('Please select a batch first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock IPFS URI for demo
      const mockIpfsUri = `ipfs://Qm${selectedBatch.batchId}MockHash`;
      
      const comprehensiveQR = await generateBatchQRCode(
        selectedBatch.batchId, 
        selectedBatch.metadata || {},
        mockIpfsUri
      );
      const verificationQR = await generateSimpleVerificationQR(selectedBatch.batchId);

      setGeneratedQRs({
        comprehensive: comprehensiveQR,
        verification: verificationQR
      });

      setSuccess('QR codes generated successfully!');
    } catch (error) {
      console.error('Error generating QR codes:', error);
      setError('Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const closeBatchModal = () => {
    setSelectedBatch(null);
    setShowBatchModal(false);
  };

  if (roleChecking && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Checking roaster permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdLocalFireDepartment size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the roaster portal</p>
        </div>
      </div>
    );
  }

  if (!hasRoasterRole && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdVerified size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have roaster permissions to create roasted bean batches. Please contact an administrator to grant you ROASTER_ROLE.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Current Address:</strong> {address}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-page-content min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-700 to-red-600 bg-clip-text text-transparent mb-4">
            Coffee Roaster Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform green coffee beans into perfectly roasted profiles with artisanal precision and comprehensive batch tracking
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-orange-600 hover:border-orange-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="web3-card web3-card-hover bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Roasting Queue</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <MdLocalFireDepartment className="w-12 h-12 text-orange-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Roasted Today</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <MdInventory className="w-12 h-12 text-red-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Medium Roast</p>
                    <p className="text-3xl font-bold">15</p>
                  </div>
                  <MdAnalytics className="w-12 h-12 text-amber-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-orange-600 to-red-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total Roasted (kg)</p>
                    <p className="text-3xl font-bold">1,800</p>
                  </div>
                  <MdInventory className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Recent Roasting Activity */}
            <div className="web3-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Roasting Activity</h3>
                <div className="flex space-x-2">
                  <button className="btn-secondary flex items-center space-x-2">
                    <MdSearch className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                  <button className="btn-secondary flex items-center space-x-2">
                    <MdFilterList className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <button className="btn-secondary flex items-center space-x-2">
                    <MdFileDownload className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Batch ID</th>
                      <th className="px-6 py-3">Origin</th>
                      <th className="px-6 py-3">Roast Profile</th>
                      <th className="px-6 py-3">Roast Date</th>
                      <th className="px-6 py-3">Quantity (60kg)</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">WAG-R001</td>
                      <td className="px-6 py-4">Ethiopian Yirgacheffe</td>
                      <td className="px-6 py-4">Medium-Light</td>
                      <td className="px-6 py-4">2024-01-15</td>
                      <td className="px-6 py-4">50</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewBatch({ batchId: 'WAG-R001', origin: 'Ethiopian Yirgacheffe', roastProfile: 'Medium-Light', roastDate: '2024-01-15', quantity: '50 bags', status: 'Completed' })}
                          className="text-orange-600 hover:text-orange-800 font-medium hover:underline transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">WAG-R002</td>
                      <td className="px-6 py-4">Ethiopian Sidamo</td>
                      <td className="px-6 py-4">Medium</td>
                      <td className="px-6 py-4">2024-01-14</td>
                      <td className="px-6 py-4">75</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Cooling</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-orange-600 hover:text-orange-800 font-medium">View Details</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Roasting Tab - Enhanced Form */}
        {activeTab === 'roast' && (
          <div className="space-y-8">
            {/* Batch Creation Mode Selector */}
            <div className="web3-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MdLocalFireDepartment className="w-6 h-6 mr-2 text-orange-600" />
                Create Roasted Bean Batch
              </h3>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setBatchCreationMode('standard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    batchCreationMode === 'standard'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Standard Batch Creation
                </button>
                <button
                  onClick={() => setBatchCreationMode('privacy-enhanced')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    batchCreationMode === 'privacy-enhanced'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <MdSecurity size={16} />
                  Privacy-Enhanced Creation
                </button>
              </div>

              {batchCreationMode === 'privacy-enhanced' ? (
                <PrivacyEnhancedBatchForm
                  onSubmit={handlePrivacyEnhancedBatchCreation}
                  userRole="ROASTER"
                  isSubmitting={loading}
                />
              ) : (
                <>
                  {/* Standard Form Content */}
            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="web3-card">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MdLocalFireDepartment className="w-6 h-6 mr-2 text-orange-600" />
                  Create Roasted Bean Batch
                </h3>
                
                <div className="space-y-6">
                  {/* Roaster Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdStore className="w-5 h-5 mr-2" />
                      Roaster Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Roaster Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={batchForm.processorName}
                          onChange={(e) => handleInputChange('processorName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          placeholder="e.g., Artisan Coffee Roasters"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Portland, Oregon"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roasting Method
                          </label>
                          <select
                            value={batchForm.roastMethod}
                            onChange={(e) => handleInputChange('roastMethod', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          >
                            <option value="Drum">Drum Roaster</option>
                            <option value="Fluid Bed">Fluid Bed</option>
                            <option value="Hot Air">Hot Air</option>
                            <option value="Probat">Probat Probatino</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Green Bean Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdCoffee className="w-5 h-5 mr-2" />
                      Green Bean Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Batch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={batchForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          placeholder="e.g., Ethiopian Yirgacheffe Roasted Beans"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Origin <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.origin}
                            onChange={(e) => handleInputChange('origin', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Yirgacheffe, Ethiopia"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Processing Method
                          </label>
                          <select
                            value={batchForm.process}
                            onChange={(e) => handleInputChange('process', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          >
                            <option value="Washed">Washed</option>
                            <option value="Natural">Natural</option>
                            <option value="Honey">Honey</option>
                            <option value="Semi-Washed">Semi-Washed</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roast Profile <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={batchForm.roastProfile}
                            onChange={(e) => handleInputChange('roastProfile', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          >
                            <option value="Light">Light</option>
                            <option value="Medium-Light">Medium-Light</option>
                            <option value="Medium">Medium</option>
                            <option value="Medium-Dark">Medium-Dark</option>
                            <option value="Dark">Dark</option>
                            <option value="French">French</option>
                            <option value="Italian">Italian</option>
                            <option value="Spanish">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity (60kg bags) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={batchForm.quantity}
                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                            placeholder="100"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={batchForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                          rows={3}
                          placeholder="Describe the roasted bean batch, roasting process, flavor profile, and any special notes..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* ZK Privacy Configuration */}
                  <div className="mb-6">
                    <ZKConfigurationPanel
                      zkConfig={zkConfig}
                      onConfigChange={setZkConfig}
                      enabled={zkEnabled}
                      onEnabledChange={setZkEnabled}
                    />
                  </div>
                  
                  <button
                    onClick={handleCreateBatch}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Roasted Bean Batch...</span>
                      </>
                    ) : (
                      <>
                        <MdAdd className="w-5 h-5" />
                        <span>Create Roasted Bean Batch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Right Column - Roasting Queue & QR Codes */}
              <div className="space-y-6">
                <div className="web3-card">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Roasting Queue</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Ethiopian Sidamo</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Roasting</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Medium Profile • 75kg • Drum Roaster</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Started: 45 min ago</span>
                        <span>Est. completion: 15 min</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Ethiopian Harrar</h4>
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Queued</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Dark Profile • 100kg • Drum Roaster</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Queue position: #1</span>
                        <span>Est. start: 20 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated QR Codes */}
                {generatedQRs && (
                  <div className="web3-card">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <MdQrCode className="w-5 h-5 mr-2 text-orange-600" />
                      Generated QR Codes
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="text-center">
                        <h5 className="text-sm font-semibold mb-2">Comprehensive Batch Info</h5>
                        <div className="bg-white p-3 rounded-lg border-2 border-gray-200 inline-block">
                          <img
                            src={generatedQRs.comprehensive}
                            alt="Comprehensive Batch QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <h5 className="text-sm font-semibold mb-2">Verification QR</h5>
                        <div className="bg-white p-3 rounded-lg border-2 border-gray-200 inline-block">
                          <img
                            src={generatedQRs.verification}
                            alt="Verification QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Roasted Bean Inventory</h3>
            <p className="text-gray-600">View and manage roasted coffee inventory, profiles, and stock levels.</p>
          </div>
        )}

        {activeTab === 'qr-codes' && (
          <div className="space-y-8">
            {/* QR Code Generation */}
            <div className="web3-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MdQrCode className="w-6 h-6 mr-2 text-orange-600" />
                Generate QR Codes for Roasted Bean Batches
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch for QR Generation
                </label>
                <select
                  value={selectedBatch?.batchId || ''}
                  onChange={(e) => {
                    // For demo purposes, create a mock batch
                    if (e.target.value) {
                      setSelectedBatch({
                        batchId: e.target.value,
                        name: `Roasted Batch ${e.target.value}`,
                        metadata: {}
                      });
                    } else {
                      setSelectedBatch(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select a roasted batch...</option>
                  <option value="WAG-ROAST-001">Premium Dark Roast (WAG-ROAST-001)</option>
                  <option value="WAG-ROAST-002">Single Origin Medium (WAG-ROAST-002)</option>
                  <option value="WAG-ROAST-003">Light Roast Ethiopian (WAG-ROAST-003)</option>
                </select>
              </div>

              <button
                onClick={generateQRCodes}
                disabled={loading || !selectedBatch}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating QR Codes...
                  </>
                ) : (
                  <>
                    <MdQrCode size={20} />
                    Generate QR Codes
                  </>
                )}
              </button>
            </div>

            {/* Generated QR Codes Display */}
            {generatedQRs && (
              <div className="web3-card">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdLocalFireDepartment size={24} />
                  Generated Roasted Bean QR Codes
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Comprehensive Batch QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img 
                        src={generatedQRs.comprehensive} 
                        alt="Comprehensive QR Code" 
                        className="mx-auto max-w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Contains complete roasted bean batch information including roast profile, date, origin traceability, and flavor notes
                    </p>
                    <button className="btn-secondary">
                      <MdFileDownload className="w-4 h-4 mr-2" />
                      Download PNG
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">Simple Verification QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img 
                        src={generatedQRs.verification} 
                        alt="Verification QR Code" 
                        className="mx-auto max-w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Quick verification code for roasted bean authentication and quality certification
                    </p>
                    <button className="btn-secondary">
                      <MdFileDownload className="w-4 h-4 mr-2" />
                      Download PNG
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Roasting Analytics</h3>
            <p className="text-gray-600">Track roasting performance, flavor profiles, and operational metrics.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Roasting Settings</h3>
            <p className="text-gray-600">Configure roasting parameters, profiles, and system preferences.</p>
          </div>
        )}

      </div>

      {/* Batch Details Modal */}
      {showBatchModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="web3-premium-card max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Roast Batch Details</h2>
              <button
                onClick={closeBatchModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                <p><span className="font-medium">Batch ID:</span> {selectedBatch.batchId}</p>
                <p><span className="font-medium">Origin:</span> {selectedBatch.origin}</p>
                <p><span className="font-medium">Roast Profile:</span> {selectedBatch.roastProfile}</p>
                <p><span className="font-medium">Quantity:</span> {selectedBatch.quantity}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Roasting Details</h3>
                <p><span className="font-medium">Roast Date:</span> {selectedBatch.roastDate}</p>
                <p>
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {selectedBatch.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeBatchModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
