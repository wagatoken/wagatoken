'use client';

import { useEffect, useState } from 'react';
import { MdDashboard, MdAdd, MdManageSearch, MdAnalytics, MdSettings, MdSearch, MdFilterList, MdFileDownload, MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdSecurity, MdScience, MdInventory, MdLocalCafe, MdCreate } from 'react-icons/md';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst, ExtendedBatchCreationData } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR, CoffeeBatchMetadata } from '../../utils/ipfsMetadata';
import ZKConfigurationPanel, { ZKConfig } from '../../components/ZKConfigurationPanel';
import PrivacyEnhancedBatchForm from '../components/PrivacyEnhancedBatchForm';

const DISABLE_AUTH_FOR_TESTING = true;

// Batch creation data type for cooperatives (green bean focus)
interface CooperativeBatchData {
  name: string;
  description: string;
  origin: string;
  farmer: string;
  altitude: string;
  process: string;
  moistureContent: number;
  density: number;
  defectCount: number;
  certifications: string[];
  cupping_notes: string[];
  quantity: number;
  packagingInfo: "60kg";
  pricePerUnit: string;
  productionDate: Date;
  expiryDate: Date;
  image?: string;
}

export default function CooperativePortal() {
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [batchCreationMode, setBatchCreationMode] = useState<'standard' | 'privacy-enhanced'>('standard');
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasCooperativeRole, setHasCooperativeRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);
  const [newCertification, setNewCertification] = useState('');
  const [newCuppingNote, setNewCuppingNote] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Batch creation form
  const [batchForm, setBatchForm] = useState<CooperativeBatchData>({
    name: '',
    description: '',
    origin: '',
    farmer: '',
    altitude: '',
    process: 'Washed',
    moistureContent: 0,
    density: 0,
    defectCount: 0,
    certifications: [],
    cupping_notes: [],
    quantity: 0,
    packagingInfo: "60kg",
    pricePerUnit: '',
    productionDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    image: ''
  });

  // ZK Privacy Configuration State
  const [zkEnabled, setZkEnabled] = useState(false);
  const [zkConfig, setZkConfig] = useState({
    enablePricePrivacy: false,
    enableQualityPrivacy: false,
    enableSupplyChainPrivacy: false,
    pricingClaim: 'Fair trade pricing verified',
    qualityClaim: 'Cooperative quality standards met',
    supplyChainClaim: 'Ethical cooperative sourcing verified'
  });

  // QR code generation state
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    verifiedBatches: 0,
    totalQuantity: 0
  });

  useEffect(() => {
    if (DISABLE_AUTH_FOR_TESTING) {
      setHasCooperativeRole(true);
      setRoleChecking(false);
      loadBatchData();
      return;
    }

    checkCooperativeRole();
  }, [address, isConnected]);

  const loadBatchData = async () => {
    try {
      console.log('🔍 Attempting to load batch data from blockchain...');
      
      try {
        // Import smart contract functions
        const { getActiveBatchIds, getBatchInfoWithMetadata } = await import('../../utils/smartContracts');
        
        // Get batch IDs from blockchain
        const batchIds = await getActiveBatchIds();
        const batchData = [];
        
        if (batchIds && batchIds.length > 0) {
          // Load batch details from blockchain
          for (const batchId of batchIds) {
            try {
              const batchInfo = await getBatchInfoWithMetadata(batchId);
              if (batchInfo) {
                // Add to cooperative batches (cooperatives typically handle green beans)
                batchData.push(batchInfo);
              }
            } catch (err) {
              console.warn(`Failed to load batch ${batchId}:`, err);
            }
          }
        }
        
        // If we got blockchain data, use it
        if (batchData.length > 0) {
          console.log('✅ Loaded batch data from blockchain:', batchData.length, 'green bean batches');
          setBatches(batchData);
          
          // Update stats based on blockchain data
          setStats({
            totalBatches: batchData.length,
            activeBatches: batchData.filter(b => !b.isVerified).length,
            verifiedBatches: batchData.filter(b => b.isVerified).length,
            totalQuantity: batchData.reduce((sum, batch) => sum + batch.quantity, 0)
          });
          return;
        } else {
          throw new Error('No green bean batches found on blockchain');
        }
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain data unavailable, using database fallback:', blockchainError);
        
        // Fallback to database API
        try {
          const response = await fetch('/api/batches');
          const data = await response.json();
          
          if (data.batches && data.batches.length > 0) {
            // Filter for green bean batches (cooperative-created)
            const cooperativeBatches = data.batches.filter((batch: any) => 
              batch.batchDetails?.productType === 'GREEN_BEANS'
            );
            
            setBatches(cooperativeBatches);
            
            // Update stats based on database data
            setStats({
              totalBatches: cooperativeBatches.length,
              activeBatches: cooperativeBatches.filter((b: any) => b.verification?.verificationStatus === 'pending').length,
              verifiedBatches: cooperativeBatches.filter((b: any) => b.verification?.verificationStatus === 'verified').length,
              totalQuantity: cooperativeBatches.reduce((sum: number, batch: any) => sum + batch.quantity, 0)
            });
          } else {
            throw new Error('No batches found in database');
          }
        } catch (dbError) {
          console.error('Database fallback also failed:', dbError);
          setBatches([]);
          setStats({
            totalBatches: 0,
            activeBatches: 0,
            verifiedBatches: 0,
            totalQuantity: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    }
  };

  const checkCooperativeRole = async () => {
    setRoleChecking(true);
    try {
      if (!isConnected || !address) {
        setHasCooperativeRole(false);
        return;
      }
      setHasCooperativeRole(true);
    } catch (error) {
      console.error('Error checking cooperative role:', error);
      setHasCooperativeRole(false);
    } finally {
      setRoleChecking(false);
    }
  };

  const handleInputChange = (field: keyof CooperativeBatchData, value: any) => {
    setBatchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: 'certifications' | 'cupping_notes', value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setBatchForm(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !batchForm.certifications.includes(newCertification.trim())) {
      setBatchForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const addCuppingNote = () => {
    if (newCuppingNote.trim() && !batchForm.cupping_notes.includes(newCuppingNote.trim())) {
      setBatchForm(prev => ({
        ...prev,
        cupping_notes: [...prev.cupping_notes, newCuppingNote.trim()]
      }));
      setNewCuppingNote('');
    }
  };

  const validateForm = (): boolean => {
    if (!batchForm.name.trim()) {
      setError('Batch name is required');
      return false;
    }
    if (!batchForm.origin.trim()) {
      setError('Origin is required');
      return false;
    }
    if (!batchForm.farmer.trim()) {
      setError('Farmer/Producer is required');
      return false;
    }
    if (batchForm.moistureContent <= 0 || batchForm.moistureContent > 20) {
      setError('Moisture content must be between 0 and 20%');
      return false;
    }
    if (batchForm.density <= 0 || batchForm.density > 2) {
      setError('Density must be between 0 and 2 g/cm³');
      return false;
    }
    if (batchForm.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }
    if (!batchForm.pricePerUnit || parseFloat(batchForm.pricePerUnit) <= 0) {
      setError('Valid price per unit is required');
      return false;
    }
    return true;
  };

  const handleCreateBatch = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const batchData = {
        name: batchForm.name,
        description: batchForm.description,
        origin: batchForm.origin,
        farmer: batchForm.farmer,
        altitude: batchForm.altitude,
        process: batchForm.process,
        certifications: batchForm.certifications,
        cupping_notes: batchForm.cupping_notes,
        quantity: batchForm.quantity,
        packagingInfo: batchForm.packagingInfo,
        pricePerUnit: batchForm.pricePerUnit,
        productionDate: batchForm.productionDate,
        expiryDate: batchForm.expiryDate,
        // Extended fields for green beans
        productType: 'GREEN_BEANS' as const,
        unitWeight: batchForm.packagingInfo,
        moistureContent: batchForm.moistureContent,
        density: batchForm.density,
        defectCount: batchForm.defectCount,
      };

      // Create batch on blockchain with ZK configuration
      const result = await createBatchBlockchainFirst(
        batchData,
        zkEnabled ? zkConfig : undefined
      );
      
      // The result already contains generated QR codes
      setGeneratedQRs({
        comprehensive: result.qrCodeDataUrl,
        verification: result.verificationQR
      });

      // Reset form and ZK config
      setBatchForm({
        name: '',
        description: '',
        origin: '',
        farmer: '',
        altitude: '',
        process: 'Washed',
        moistureContent: 0,
        density: 0,
        defectCount: 0,
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: "60kg",
        pricePerUnit: '',
        productionDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        image: ''
      });

      // Reset ZK configuration
      setZkEnabled(false);
      setZkConfig({
        enablePricePrivacy: false,
        enableQualityPrivacy: false,
        enableSupplyChainPrivacy: false,
        pricingClaim: 'Fair trade pricing verified',
        qualityClaim: 'Cooperative quality standards met',
        supplyChainClaim: 'Ethical cooperative sourcing verified'
      });

      // Enhanced success message with ZK info
      let successMessage = `Green Bean Batch created successfully! Batch ID: ${result.batchId}`;
      if (result.zkResults) {
        successMessage += ` - Privacy features enabled (${result.zkResults.proofsGenerated.length} ZK proofs)`;
      }
      setSuccess(successMessage);
      
      // Refresh batch data to update stats and list
      await loadBatchData();
    } catch (error) {
      console.error('Error creating batch:', error);
      setError('Failed to create green bean batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyEnhancedBatchCreation = async (data: any) => {
    console.log('Privacy Enhanced Batch Creation initiated:', data);
    // This will be handled by the PrivacyEnhancedBatchForm component
  };

  const handleViewBatch = (batch: any) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  // QR Code generation
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

  if (roleChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking cooperative access...</p>
        </div>
      </div>
    );
  }

  if (!hasCooperativeRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <MdCoffee size={64} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            This portal is restricted to registered coffee cooperatives. Please contact support if you believe this is an error.
          </p>
          <button
            onClick={checkCooperativeRole}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MdRefresh size={20} />
            Retry Access Check
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-page-content min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cooperative Portal</h1>
          <p className="text-gray-600">Create and manage green coffee bean batches for the supply chain</p>
        </div>

        {/* Tab Navigation */}
        <div className="web3-premium-card animate-card-entrance mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
              { id: 'create', label: 'Create Batch', icon: MdAdd },
              { id: 'manage', label: 'Manage Batches', icon: MdManageSearch },
              { id: 'qr-codes', label: 'QR Codes', icon: MdQrCode },
              { id: 'analytics', label: 'Analytics', icon: MdAnalytics },
              { id: 'settings', label: 'Settings', icon: MdSettings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="web3-card web3-card-hover bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Batches</p>
                    <p className="text-3xl font-bold text-white">{stats.totalBatches}</p>
                  </div>
                  <MdCoffee size={32} className="text-emerald-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Active Batches</p>
                    <p className="text-3xl font-bold text-white">{stats.activeBatches}</p>
                  </div>
                  <MdInventory size={32} className="text-blue-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Verified</p>
                    <p className="text-3xl font-bold text-white">{stats.verifiedBatches}</p>
                  </div>
                  <MdVerified size={32} className="text-purple-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Total Quantity</p>
                    <p className="text-3xl font-bold text-white">{stats.totalQuantity} bags</p>
                  </div>
                  <MdGrade size={32} className="text-amber-200" />
                </div>
              </div>
            </div>

            {/* Recent Batches Table */}
            <div className="web3-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Batches</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MdSearch size={16} />
                    Search
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MdFilterList size={16} />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MdFileDownload size={16} />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <MdCoffee size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No batches created yet</p>
                          <p className="text-sm">Create your first green coffee batch to get started</p>
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{batch.batchId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.origin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.quantity} bags
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              batch.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {batch.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleViewBatch(batch)}
                              className="text-green-600 hover:text-green-900 font-medium hover:underline transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Batch Creation Mode Selector */}
            <div className="web3-premium-card animate-card-entrance">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MdQrCode size={24} className="text-emerald-600" />
                Choose Batch Creation Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setBatchCreationMode('standard')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    batchCreationMode === 'standard'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">Standard Batch Creation</h4>
                  <p className="text-gray-600 text-sm">Create regular green bean batches with public metadata</p>
                </button>
                <button
                  onClick={() => setBatchCreationMode('privacy-enhanced')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    batchCreationMode === 'privacy-enhanced'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MdSecurity size={20} className="text-emerald-600" />
                    <h4 className="font-semibold text-lg text-gray-900">Privacy Enhanced</h4>
                  </div>
                  <p className="text-gray-600 text-sm">Create batches with encrypted sensitive data and ZK proofs</p>
                </button>
              </div>
            </div>

            {batchCreationMode === 'standard' && (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="web3-form-section">
                      <h3 className="flex items-center gap-2 mb-4">
                        <MdCoffee size={20} />
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="web3-form-label">
                            Batch Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., Yirgacheffe Grade 1 Green Beans"
                          />
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Origin <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.origin}
                            onChange={(e) => handleInputChange('origin', e.target.value)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., Yirgacheffe, Ethiopia"
                          />
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Farmer/Producer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.farmer}
                            onChange={(e) => handleInputChange('farmer', e.target.value)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., Mulugeta Dukamo"
                          />
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Altitude
                          </label>
                          <input
                            type="text"
                            value={batchForm.altitude}
                            onChange={(e) => handleInputChange('altitude', e.target.value)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., 1800-2200 masl"
                          />
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Processing Method
                          </label>
                          <select
                            value={batchForm.process}
                            onChange={(e) => handleInputChange('process', e.target.value)}
                            className="web3-ethereum-input w-full"
                          >
                            <option value="Washed">Washed</option>
                            <option value="Natural">Natural</option>
                            <option value="Honey">Honey</option>
                            <option value="Anaerobic">Anaerobic</option>
                          </select>
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Description
                          </label>
                          <textarea
                            value={batchForm.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="web3-ethereum-input w-full h-24 resize-none"
                            placeholder="Describe the characteristics of this green coffee batch..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="web3-form-section">
                      <h3 className="flex items-center gap-2 mb-4">
                        <MdScience size={20} />
                        Quality Metrics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="web3-form-label">
                            Moisture Content (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="8"
                            max="20"
                            value={batchForm.moistureContent}
                            onChange={(e) => handleInputChange('moistureContent', parseFloat(e.target.value) || 0)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., 12.5"
                          />
                          <p className="text-xs text-gray-500 mt-1">Optimal range: 8-12%</p>
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Density (g/cm³) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.1"
                            max="2"
                            value={batchForm.density}
                            onChange={(e) => handleInputChange('density', parseFloat(e.target.value) || 0)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., 0.72"
                          />
                          <p className="text-xs text-gray-500 mt-1">Higher density indicates better quality</p>
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Defect Count <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={batchForm.defectCount}
                            onChange={(e) => handleInputChange('defectCount', parseInt(e.target.value) || 0)}
                            className="web3-ethereum-input w-full"
                            placeholder="e.g., 5"
                          />
                          <p className="text-xs text-gray-500 mt-1">Per 350g sample</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Production Details */}
                    <div className="web3-form-section">
                      <h3 className="flex items-center gap-2 mb-4">
                        <MdInventory size={20} />
                        Production Details
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="web3-form-label">
                              Production Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={batchForm.productionDate.toISOString().split('T')[0]}
                              onChange={(e) => handleInputChange('productionDate', new Date(e.target.value))}
                              className="web3-ethereum-input w-full"
                            />
                          </div>

                          <div>
                            <label className="web3-form-label">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={batchForm.expiryDate.toISOString().split('T')[0]}
                              onChange={(e) => handleInputChange('expiryDate', new Date(e.target.value))}
                              className="web3-ethereum-input w-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="web3-form-label">
                              Quantity (60kg bags) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={batchForm.quantity}
                              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                              className="web3-ethereum-input w-full"
                              placeholder="e.g., 100"
                            />
                          </div>

                          <div>
                            <label className="web3-form-label">
                              Price per Bag (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={batchForm.pricePerUnit}
                              onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                              className="web3-ethereum-input w-full"
                              placeholder="e.g., 350.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="web3-form-label">
                            Packaging Type
                          </label>
                          <select
                            value={batchForm.packagingInfo}
                            onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                            className="web3-ethereum-input w-full"
                          >
                            <option value="60kg">60kg Jute Bags</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="web3-form-section">
                      <h3 className="flex items-center gap-2 mb-4">
                        <MdVerified size={20} />
                        Certifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {batchForm.certifications.map((cert, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                            >
                              {cert}
                              <button
                                type="button"
                                onClick={() => {
                                  const newCerts = batchForm.certifications.filter((_, i) => i !== index);
                                  handleInputChange('certifications', newCerts);
                                }}
                                className="ml-2 text-emerald-600 hover:text-emerald-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCertification}
                            onChange={(e) => setNewCertification(e.target.value)}
                            className="web3-ethereum-input flex-1"
                            placeholder="e.g., Organic, Fair Trade, UTZ"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCertification();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={addCertification}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cupping Notes */}
                    <div className="web3-form-section">
                      <h3 className="flex items-center gap-2 mb-4">
                        <MdLocalCafe size={20} />
                        Cupping Notes
                      </h3>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {batchForm.cupping_notes.map((note, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200"
                            >
                              {note}
                              <button
                                type="button"
                                onClick={() => {
                                  const newNotes = batchForm.cupping_notes.filter((_, i) => i !== index);
                                  handleInputChange('cupping_notes', newNotes);
                                }}
                                className="ml-2 text-amber-600 hover:text-amber-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCuppingNote}
                            onChange={(e) => setNewCuppingNote(e.target.value)}
                            className="web3-ethereum-input flex-1"
                            placeholder="e.g., Floral, Bright acidity, Tea-like"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCuppingNote();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={addCuppingNote}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ZK Privacy Configuration */}
                    <div className="web3-form-section">
                      <ZKConfigurationPanel
                        zkConfig={zkConfig}
                        onConfigChange={setZkConfig}
                        enabled={zkEnabled}
                        onEnabledChange={setZkEnabled}
                      />
                    </div>

                    {/* Create Batch Button */}
                    <div className="web3-form-section">
                      <button
                        onClick={handleCreateBatch}
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Creating Green Bean Batch...
                          </>
                        ) : (
                          <>
                            <MdCreate className="mr-3" size={24} />
                            Create Green Bean Batch
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                {generatedQRs && (
                  <div className="web3-premium-card animate-card-entrance">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <MdQrCode size={24} className="text-emerald-600" />
                      Green Bean Batch QR Codes Generated
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="web3-card text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                          <MdQrCode className="text-emerald-600" size={24} />
                          Comprehensive Batch QR
                        </h4>
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-white rounded-xl border-2 border-emerald-200 shadow-lg">
                            <img
                              src={generatedQRs.comprehensive}
                              alt="Batch QR Code"
                              className="max-w-full h-auto"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">Contains full batch metadata and IPFS link</p>
                      </div>
                      <div className="web3-card text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                          <MdVerified className="text-emerald-600" size={24} />
                          Quick Verification QR
                        </h4>
                        <div className="flex justify-center mb-4">
                          <div className="p-4 bg-white rounded-xl border-2 border-emerald-200 shadow-lg">
                            <img
                              src={generatedQRs.verification}
                              alt="Verification QR Code"
                              className="max-w-full h-auto"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">For quick green bean batch verification</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {batchCreationMode === 'privacy-enhanced' && (
              <PrivacyEnhancedBatchForm
                onSubmit={handlePrivacyEnhancedBatchCreation}
                userRole="COOPERATIVE"
              />
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Batch Management</h3>
            <p className="text-gray-600">Manage existing batches, update inventory, and track verification status.</p>
            {/* Batch management functionality will be implemented here */}
          </div>
        )}

        {activeTab === 'qr-codes' && (
          <div className="space-y-8">
            {/* QR Code Generation */}
            <div className="web3-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MdQrCode className="w-6 h-6 mr-2 text-emerald-600" />
                Generate QR Codes for Green Bean Batches
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch for QR Generation
                </label>
                <select
                  value={selectedBatch?.batchId || ''}
                  onChange={(e) => {
                    const batch = batches.find(b => b.batchId === e.target.value);
                    setSelectedBatch(batch || null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select a green bean batch...</option>
                  {batches.map((batch) => (
                    <option key={batch.batchId} value={batch.batchId}>
                      {batch.name} ({batch.batchId})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateQRCodes}
                disabled={loading || !selectedBatch}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  <MdLocalCafe size={24} />
                  Generated Green Bean QR Codes
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
                      Contains complete green bean batch information including farmer details, processing method, quality metrics, and traceability data
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
                      Quick verification code for basic batch authentication and supply chain tracking
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">Production Analytics</h3>
            <p className="text-gray-600">View production trends, quality metrics, and performance insights.</p>
            {/* Analytics dashboard will be implemented here */}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Cooperative Settings</h3>
            <p className="text-gray-600">Configure cooperative profile, notification preferences, and system settings.</p>
            {/* Settings panel will be implemented here */}
          </div>
        )}
      </div>

      {/* Batch Details Modal */}
      {showBatchModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="web3-premium-card max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Batch Details</h2>
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
                <p><span className="font-medium">Batch ID:</span> #{selectedBatch.batchId}</p>
                <p><span className="font-medium">Name:</span> {selectedBatch.name}</p>
                <p><span className="font-medium">Origin:</span> {selectedBatch.origin}</p>
                <p><span className="font-medium">Farmer:</span> {selectedBatch.farmer}</p>
                <p><span className="font-medium">Quantity:</span> {selectedBatch.quantity} bags</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality & Status</h3>
                <p><span className="font-medium">Process:</span> {selectedBatch.process}</p>
                <p><span className="font-medium">Altitude:</span> {selectedBatch.altitude}</p>
                <p>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedBatch.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedBatch.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </p>
                {selectedBatch.certifications && selectedBatch.certifications.length > 0 && (
                  <div className="mt-2">
                    <span className="font-medium">Certifications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBatch.certifications.map((cert: string, index: number) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedBatch.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedBatch.description}</p>
              </div>
            )}
            
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
