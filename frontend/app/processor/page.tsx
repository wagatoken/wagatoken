'use client';

import { useEffect, useState } from 'react';
// import { useAccount } from 'wagmi';
import { MdDashboard, MdBuild, MdInventory, MdAnalytics, MdSettings, MdAdd, MdSearch, MdFilterList, MdFileDownload, MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode } from 'react-icons/md';
import { ethers } from 'ethers';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR, CoffeeBatchMetadata } from '../../utils/ipfsMetadata';

const DISABLE_AUTH_FOR_TESTING = true; // Set to false to re-enable authentication

// Batch creation data type for processors
interface ProcessorBatchData {
  name: string;
  description: string;
  origin: string;
  farmer: string;
  altitude: string;
  process: string;
  roastProfile: string;
  roastDate: string;
  certifications: string[];
  cupping_notes: string[];
  quantity: number;
  packagingInfo: "250g" | "500g" | "60kg";
  pricePerUnit: string;
  productionDate: Date;
  expiryDate: Date;
  image?: string;
}

export default function ProcessorPortal() {
  // const { isConnected, address } = useAccount();
  const { address, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasProcessorRole, setHasProcessorRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);

  // Batch creation form
  const [batchForm, setBatchForm] = useState<ProcessorBatchData>({
    name: '',
    description: '',
    origin: '',
    farmer: '',
    altitude: '',
    process: 'Washed',
    roastProfile: 'Medium',
    roastDate: new Date().toISOString().split('T')[0],
    certifications: [],
    cupping_notes: [],
    quantity: 0,
    packagingInfo: '250g' as "250g" | "500g" | "60kg",
    pricePerUnit: '0.045',
    productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
    expiryDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)), // 90 days from now
  });

  // Generated QR codes
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { id: 'process', label: 'Processing', icon: MdBuild },
    { id: 'inventory', label: 'Inventory', icon: MdInventory },
    { id: 'analytics', label: 'Analytics', icon: MdAnalytics },
    { id: 'settings', label: 'Settings', icon: MdSettings },
  ];

  // Check processor role on component mount
  useEffect(() => {
    if (!DISABLE_AUTH_FOR_TESTING) {
      checkProcessorRole();
    } else {
      setRoleChecking(false);
      setHasProcessorRole(true);
    }
  }, [address, isConnected]);

  const checkProcessorRole = async () => {
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

      // Check if user has PROCESSOR_ROLE
      const processorRole = await coffeeTokenContract.PROCESSOR_ROLE();
      const hasRole = await coffeeTokenContract.hasRole(processorRole, address);

      setHasProcessorRole(hasRole);
    } catch (error) {
      console.error('Error checking processor role:', error);
      setError('Failed to verify processor permissions');
    } finally {
      setRoleChecking(false);
    }
  };

  const handleInputChange = (field: keyof ProcessorBatchData, value: any) => {
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
    if (batchForm.quantity <= 0) errors.push('Quantity must be greater than 0');
    if (!batchForm.packagingInfo) errors.push('Packaging information is required');
    if (parseFloat(batchForm.pricePerUnit) <= 0) errors.push('Price per unit must be greater than 0');

    const now = new Date();
    if (batchForm.productionDate > now) errors.push('Production date cannot be in the future');
    if (batchForm.expiryDate <= batchForm.productionDate) errors.push('Expiry date must be after production date');

    return errors;
  };

  const handleCreateBatch = async () => {
    if (!isConnected || !hasProcessorRole) {
      setError('Please connect your wallet and ensure you have processor permissions');
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

      // Create batch using blockchain-first workflow
      const result = await createBatchBlockchainFirst({
        ...batchForm,
        productType: 'RETAIL_BAGS', // Processors create retail bags
        unitWeight: batchForm.packagingInfo
      });

      setSuccess(`Batch created successfully! Batch ID: ${result.batchId}`);

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
          roastProfile: batchForm.roastProfile,
          roastDate: batchForm.roastDate,
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

      // Reset form
      setBatchForm({
        name: '',
        description: '',
        origin: '',
        farmer: '',
        altitude: '',
        process: 'Washed',
        roastProfile: 'Medium',
        roastDate: new Date().toISOString().split('T')[0],
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: '250g' as "250g" | "500g" | "60kg",
        pricePerUnit: '0.045',
        productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
        expiryDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)),
      });

    } catch (error) {
      console.error('Error creating batch:', error);
      setError(error instanceof Error ? error.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  if (roleChecking && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <span className="ml-3 text-gray-600">Checking processor permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdCoffee size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the processor portal</p>
        </div>
      </div>
    );
  }

  if (!hasProcessorRole && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdVerified size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have processor permissions to create batches. Please contact an administrator to grant you PROCESSOR_ROLE.
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

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-4">
            Coffee Processor Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform raw coffee beans into premium processed coffee with advanced quality control and batch tracking
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
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-gray-500 hover:text-amber-600 hover:border-amber-300'
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
              <div className="web3-card web3-card-hover bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Processing Queue</p>
                    <p className="text-3xl font-bold">12</p>
                  </div>
                  <MdBuild className="w-12 h-12 text-amber-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Processed Today</p>
                    <p className="text-3xl font-bold">5</p>
                  </div>
                  <MdInventory className="w-12 h-12 text-orange-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Quality AA Grade</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <MdAnalytics className="w-12 h-12 text-yellow-200" />
                </div>
              </div>
              <div className="web3-card web3-card-hover bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Total Processed (kg)</p>
                    <p className="text-3xl font-bold">2,450</p>
                  </div>
                  <MdInventory className="w-12 h-12 text-amber-200" />
                </div>
              </div>
            </div>

            {/* Recent Processing Activity */}
            <div className="web3-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Processing Activity</h3>
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
                      <th className="px-6 py-3">Source Farm</th>
                      <th className="px-6 py-3">Processing Method</th>
                      <th className="px-6 py-3">Quality Grade</th>
                      <th className="px-6 py-3">Quantity (kg)</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">WAG-001</td>
                      <td className="px-6 py-4">Highland Farms Co-op</td>
                      <td className="px-6 py-4">Washed</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">AA</span>
                      </td>
                      <td className="px-6 py-4">500</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Processing</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-amber-600 hover:text-amber-800 font-medium">View Details</button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">WAG-002</td>
                      <td className="px-6 py-4">Mountain View Farm</td>
                      <td className="px-6 py-4">Natural</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">AB</span>
                      </td>
                      <td className="px-6 py-4">350</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-amber-600 hover:text-amber-800 font-medium">View Details</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab - Enhanced Form */}
        {activeTab === 'process' && (
          <div className="space-y-8">
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
                  <MdBuild className="w-6 h-6 mr-2 text-amber-600" />
                  Create Retail Coffee Batch
                </h3>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdCoffee className="w-5 h-5 mr-2" />
                      Basic Information
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          placeholder="e.g., Ethiopian Yirgacheffe"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Ethiopia, Yirgacheffe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Farmer/Producer <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={batchForm.farmer}
                            onChange={(e) => handleInputChange('farmer', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Local Cooperative"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Processing Method
                          </label>
                          <select
                            value={batchForm.process}
                            onChange={(e) => handleInputChange('process', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          >
                            <option value="Washed">Washed</option>
                            <option value="Natural">Natural</option>
                            <option value="Honey">Honey</option>
                            <option value="Anaerobic">Anaerobic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roast Profile
                          </label>
                          <select
                            value={batchForm.roastProfile}
                            onChange={(e) => handleInputChange('roastProfile', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          >
                            <option value="Light">Light</option>
                            <option value="Medium-Light">Medium-Light</option>
                            <option value="Medium">Medium</option>
                            <option value="Medium-Dark">Medium-Dark</option>
                            <option value="Dark">Dark</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Production Details */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <MdInventory className="w-5 h-5 mr-2" />
                      Production Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={batchForm.quantity}
                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                            placeholder="1000"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Packaging <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={batchForm.packagingInfo}
                            onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          >
                            <option value="250g">250g Bags</option>
                            <option value="500g">500g Bags</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Unit (USD) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={batchForm.pricePerUnit}
                          onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          placeholder="0.045"
                          min="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={batchForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                          rows={3}
                          placeholder="Describe the coffee batch, its characteristics, and any special notes..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreateBatch}
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Batch...</span>
                      </>
                    ) : (
                      <>
                        <MdAdd className="w-5 h-5" />
                        <span>Create Retail Coffee Batch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Right Column - Processing Queue */}
              <div className="web3-card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Processing Queue</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">WAG-001</h4>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Washed Process • Highland Farms Co-op</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Started: 2 days ago</span>
                      <span>Est. completion: 5 days</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">WAG-003</h4>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Queued</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Natural Process • Valley Farms</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Queue position: #2</span>
                      <span>Est. start: Tomorrow</span>
                    </div>
                  </div>
                </div>

                {/* Generated QR Codes */}
                {generatedQRs && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <MdQrCode className="w-5 h-5 mr-2 text-amber-600" />
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
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Processed Coffee Inventory</h3>
            <p className="text-gray-600">View and manage processed coffee inventory, quality grades, and stock levels.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Processing Analytics</h3>
            <p className="text-gray-600">Track processing efficiency, quality trends, and operational metrics.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="web3-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Processing Settings</h3>
            <p className="text-gray-600">Configure processing parameters, quality standards, and system preferences.</p>
          </div>
        )}

      </div>
    </div>
  );

  return content;
}
