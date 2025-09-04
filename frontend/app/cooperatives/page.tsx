'use client';

// 🚨 TEMPORARY: Disable auth for layout testing - SET TO false FOR PRODUCTION
// To re-enable authentication: Change DISABLE_AUTH_FOR_TESTING = false
// This will restore wallet connection requirements and role-based access control
const DISABLE_AUTH_FOR_TESTING = true;

import React, { useState, useEffect } from 'react';
// import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdInventory, MdAgriculture, MdNature, MdDashboard, MdAnalytics, MdSettings, MdHistory, MdFileDownload, MdFileUpload, MdSearch, MdFilterList, MdVisibility, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useWallet } from '../components/WalletProvider';
// import { createBatchBlockchainFirst } from '../../utils/smartContracts';
// import { generateBatchQRCode, generateSimpleVerificationQR, CoffeeBatchMetadata } from '../../utils/ipfsMetadata';

// Batch creation data type for cooperatives
interface CooperativeBatchData {
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

  // Green bean specific fields
  moistureContent: number;
  density: number;
  defectCount: number;
  cooperativeId: string;
  cooperativeName: string;
  location: string;
}

export default function CooperativesPortal() {
  // const { address, isConnected } = useAccount();
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasCooperativeRole, setHasCooperativeRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard data
  const [batches, setBatches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    verifiedBatches: 0,
    totalQuantity: 0
  });

  // Batch creation form
  const [batchForm, setBatchForm] = useState<CooperativeBatchData>({
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
    pricePerUnit: '2.50',
    productionDate: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)), // 14 days ago (harvest time)
    expiryDate: new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)), // 6 months from now

    // Green bean specific fields
    moistureContent: 12.5,
    density: 0.75,
    defectCount: 0,
    cooperativeId: '',
    cooperativeName: '',
    location: '',
  });

  // Generated QR codes
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Check cooperative role on component mount
  useEffect(() => {
    checkCooperativeRole();
  }, [address, isConnected]);

  const checkCooperativeRole = async () => {
    if (!address || !isConnected) {
      setRoleChecking(false);
      return;
    }

    try {
      setRoleChecking(true);
      // TODO: Implement smart contract role checking
      // For now, we'll assume cooperative role is granted
      setHasCooperativeRole(true);
      
      /*
      // Import contract utilities
      const { getContract, getSigner, COFFEE_TOKEN_ABI } = await import('../../utils/smartContracts');
      const coffeeTokenAddress = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS;

      if (!coffeeTokenAddress) {
        throw new Error('Coffee token address not configured');
      }

      const signer = await getSigner();
      const coffeeTokenContract = getContract(coffeeTokenAddress, COFFEE_TOKEN_ABI, signer);

      // Check if user has COOPERATIVE_ROLE
      const cooperativeRole = await coffeeTokenContract.COOPERATIVE_ROLE();
      const hasRole = await coffeeTokenContract.hasRole(cooperativeRole, address);

      setHasCooperativeRole(hasRole);
      */
    } catch (error) {
      console.error('Error checking cooperative role:', error);
      setError('Failed to verify cooperative permissions');
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
    if (!batchForm.cooperativeName.trim()) errors.push('Cooperative name is required');
    if (!batchForm.location.trim()) errors.push('Location is required');
    if (!batchForm.cooperativeId.trim()) errors.push('Cooperative Ethereum address is required');
    if (batchForm.quantity <= 0) errors.push('Quantity must be greater than 0');
    if (!batchForm.packagingInfo) errors.push('Packaging information is required');
    if (parseFloat(batchForm.pricePerUnit) <= 0) errors.push('Price per unit must be greater than 0');
    if (batchForm.moistureContent < 8 || batchForm.moistureContent > 20) errors.push('Moisture content should be between 8% and 20%');
    if (batchForm.density <= 0 || batchForm.density > 2) errors.push('Density should be between 0 and 2 g/cm³');

    const now = new Date();
    if (batchForm.productionDate > now) errors.push('Production date cannot be in the future');
    if (batchForm.expiryDate <= batchForm.productionDate) errors.push('Expiry date must be after production date');

    return errors;
  };

  const handleCreateBatch = async () => {
    if (!isConnected || !hasCooperativeRole) {
      setError('Please connect your wallet and ensure you have cooperative permissions');
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

      // TODO: Implement blockchain batch creation
      // For now, we'll simulate batch creation
      const batchId = `COOP-${Date.now()}`;
      
      setSuccess(`Green bean batch created successfully! Batch ID: ${batchId}`);

      // TODO: Generate QR codes when IPFS integration is ready
      /*
      // Create batch using blockchain-first workflow
      const result = await createBatchBlockchainFirst({
        ...batchForm,
        productType: 'GREEN_BEANS', // Cooperatives create green beans
        cooperativeId: batchForm.cooperativeId
      });

      setSuccess(`Green bean batch created successfully! Batch ID: ${result.batchId}`);

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
          roastProfile: '', // Green beans don't have roast profile
          roastDate: '', // Green beans don't have roast date
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
      */

      // Reset form
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
        pricePerUnit: '2.50',
        productionDate: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)),
        expiryDate: new Date(Date.now() + (180 * 24 * 60 * 60 * 1000)),

        // Green bean specific fields
        moistureContent: 12.5,
        density: 0.75,
        defectCount: 0,
        cooperativeId: '',
        cooperativeName: '',
        location: '',
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Checking cooperative permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdAgriculture size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the cooperatives portal</p>
        </div>
      </div>
    );
  }

  if (!hasCooperativeRole && !DISABLE_AUTH_FOR_TESTING) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="text-center">
          <MdVerified size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have cooperative permissions to create green bean batches. Please contact an administrator to grant you COOPERATIVE_ROLE.
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
    <div className="min-h-screen web3-section">
      <div className="max-w-7xl mx-auto web3-page-spacing relative z-10">
      {/* Header */}
      <div className="mb-12 animate-card-entrance">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float web3-cyber-glow flex justify-center">
            <MdNature size={96} className="text-green-600" />
          </div>
          <h1 className="text-5xl font-bold web3-gradient-text mb-4">
            WAGA Cooperatives Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create and manage green coffee bean batches (60kg) with origin certification and quality documentation for supply chain partners
          </p>
        </div>

        {/* Connection Status */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-sm text-green-700">Connected as Cooperative</div>
            <div className="text-xs text-green-600 font-mono">{address}</div>
          </div>
        </div>
      </div>

      {/* Advanced Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
              { id: 'create', label: 'Create Batch', icon: <MdAdd size={20} /> },
              { id: 'manage', label: 'Manage Batches', icon: <MdInventory size={20} /> },
              { id: 'analytics', label: 'Analytics', icon: <MdAnalytics size={20} /> },
              { id: 'settings', label: 'Settings', icon: <MdSettings size={20} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="web3-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Batches</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalBatches}</p>
                </div>
                <MdCoffee size={32} className="text-green-500" />
              </div>
            </div>
            <div className="web3-card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Active Batches</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.activeBatches}</p>
                </div>
                <MdInventory size={32} className="text-blue-500" />
              </div>
            </div>
            <div className="web3-card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Verified</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.verifiedBatches}</p>
                </div>
                <MdVerified size={32} className="text-purple-500" />
              </div>
            </div>
            <div className="web3-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Total Quantity</p>
                  <p className="text-3xl font-bold text-amber-900">{stats.totalQuantity} kg</p>
                </div>
                <MdGrade size={32} className="text-amber-500" />
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
                          #{batch.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.origin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {batch.quantity} kg
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <MdVisibility size={16} />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <MdEdit size={16} />
                            </button>
                            <button className="text-amber-600 hover:text-amber-900">
                              <MdQrCode size={16} />
                            </button>
                          </div>
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
        <div className="web3-card">{/* Batch Creation Form */}
      <div className="web3-premium-card animate-card-entrance">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Green Coffee Bean Batch</h2>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Batch Creation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Cooperative Information */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdAgriculture size={20} />
                Cooperative Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="web3-form-label">
                    Cooperative Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.cooperativeName}
                    onChange={(e) => handleInputChange('cooperativeName', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Yirgacheffe Farmers Cooperative"
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Yirgacheffe, Ethiopia"
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Cooperative Ethereum Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.cooperativeId}
                    onChange={(e) => handleInputChange('cooperativeId', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="0x..."
                  />
                </div>
              </div>
            </div>

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
                    placeholder="e.g., Local Smallholder Farmers"
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Altitude (meters)
                  </label>
                  <input
                    type="text"
                    value={batchForm.altitude}
                    onChange={(e) => handleInputChange('altitude', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., 1800-2200"
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
                    <option value="Semi-Washed">Semi-Washed</option>
                  </select>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="web3-form-label">
                      Quantity (60kg bags) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={batchForm.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className="web3-ethereum-input w-full"
                      placeholder="100"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="web3-form-label">
                      Price per 60kg Bag (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={batchForm.pricePerUnit}
                      onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                      className="web3-ethereum-input w-full"
                      placeholder="2.50"
                      min="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="web3-form-label">
                      Harvest Date <span className="text-red-500">*</span>
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
              </div>
            </div>

            {/* Quality Specifications */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdGrade size={20} />
                Quality Specifications
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
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
                      onChange={(e) => handleInputChange('moistureContent', parseFloat(e.target.value) || 12.5)}
                      className="web3-ethereum-input w-full"
                      placeholder="12.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">8-20% optimal range</p>
                  </div>

                  <div>
                    <label className="web3-form-label">
                      Density (g/cm³) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="2.0"
                      value={batchForm.density}
                      onChange={(e) => handleInputChange('density', parseFloat(e.target.value) || 0.75)}
                      className="web3-ethereum-input w-full"
                      placeholder="0.75"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.5-2.0 typical range</p>
                  </div>

                  <div>
                    <label className="web3-form-label">
                      Defect Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={batchForm.defectCount}
                      onChange={(e) => handleInputChange('defectCount', parseInt(e.target.value) || 0)}
                      className="web3-ethereum-input w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="web3-form-label">
                    Certifications (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={batchForm.certifications.join(', ')}
                    onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="Organic, Fair Trade, Rainforest Alliance"
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Cupping Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={batchForm.cupping_notes.join(', ')}
                    onChange={(e) => handleArrayInputChange('cupping_notes', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="Floral, Citrus, Clean acidity"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdInfo size={20} />
                Description
              </h3>
              <textarea
                value={batchForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="web3-ethereum-input w-full h-24 resize-none"
                placeholder="Describe the green bean batch, quality characteristics, growing conditions, and any special notes..."
              />
            </div>

            {/* Create Batch Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleCreateBatch}
                disabled={loading}
                className="web3-ethereum-button px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Green Bean Batch...
                  </div>
                ) : (
                  'Create Green Bean Batch'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated QR Codes */}
      {generatedQRs && (
        <div className="web3-premium-card animate-card-entrance">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MdQrCode size={24} className="text-emerald-600" />
            Green Bean Batch QR Codes Generated
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Comprehensive Batch Info</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={generatedQRs.comprehensive}
                  alt="Comprehensive Batch QR Code"
                  className="max-w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Contains full green bean batch information and metadata</p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Verification QR</h3>
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={generatedQRs.verification}
                  alt="Verification QR Code"
                  className="max-w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">For quick green bean batch verification</p>
            </div>
          </div>
        </div>
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
    </div>
  );
}
