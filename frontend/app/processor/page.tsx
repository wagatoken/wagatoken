'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdInventory } from 'react-icons/md';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR } from '../../utils/ipfsMetadata';

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
  packagingInfo: string; // 250g or 500g
  pricePerUnit: string;
  productionDate: Date;
  expiryDate: Date;
}

export default function ProcessorPortal() {
  const { account, signer, isConnected } = useWallet();
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
    packagingInfo: '250g',
    pricePerUnit: '0.045',
    productionDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)), // 7 days ago
    expiryDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)), // 90 days from now
  });

  // Generated QR codes
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Check processor role on component mount
  useEffect(() => {
    checkProcessorRole();
  }, [account, signer, isConnected]);

  const checkProcessorRole = async () => {
    if (!account || !signer || !isConnected) {
      setRoleChecking(false);
      return;
    }

    try {
      setRoleChecking(true);
      // Import contract utilities
      const { getContract } = await import('../../utils/smartContracts');
      const coffeeTokenAddress = process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS;

      if (!coffeeTokenAddress) {
        throw new Error('Coffee token address not configured');
      }

      const coffeeTokenContract = getContract(coffeeTokenAddress, [], signer);

      // Check if user has PROCESSOR_ROLE
      const processorRole = await coffeeTokenContract.PROCESSOR_ROLE();
      const hasRole = await coffeeTokenContract.hasRole(processorRole, account);

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
    if (!isConnected || !signer || !hasProcessorRole) {
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
      const qrCodeDataUrl = await generateBatchQRCode(result.batchId, batchForm, result.ipfsUri);
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
        packagingInfo: '250g',
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

  if (roleChecking) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Checking processor permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
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

  if (!hasProcessorRole) {
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
              <strong>Current Address:</strong> {account}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MdCoffee size={32} className="text-emerald-600" />
              Processor Portal
            </h1>
            <p className="text-gray-600">
              Create and manage retail coffee batches for distribution
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Connected as Processor</div>
            <div className="text-xs text-gray-400 font-mono">{account}</div>
          </div>
        </div>
      </div>

      {/* Batch Creation Form */}
      <div className="web3-premium-card animate-card-entrance">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Retail Coffee Batch</h2>

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
                    placeholder="e.g., Ethiopian Yirgacheffe"
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
                    placeholder="e.g., Ethiopia, Yirgacheffe"
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
                    placeholder="e.g., Local Cooperative"
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
              </div>
            </div>

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
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={batchForm.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className="web3-ethereum-input w-full"
                      placeholder="1000"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="web3-form-label">
                      Packaging <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={batchForm.packagingInfo}
                      onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                      className="web3-ethereum-input w-full"
                    >
                      <option value="250g">250g Bags</option>
                      <option value="500g">500g Bags</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="web3-form-label">
                    Price per Unit (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={batchForm.pricePerUnit}
                    onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="0.045"
                    min="0.01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quality Information */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdGrade size={20} />
                Quality Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="web3-form-label">
                    Roast Profile
                  </label>
                  <select
                    value={batchForm.roastProfile}
                    onChange={(e) => handleInputChange('roastProfile', e.target.value)}
                    className="web3-ethereum-input w-full"
                  >
                    <option value="Light">Light</option>
                    <option value="Medium-Light">Medium-Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Medium-Dark">Medium-Dark</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="web3-form-label">
                    Roast Date
                  </label>
                  <input
                    type="date"
                    value={batchForm.roastDate}
                    onChange={(e) => handleInputChange('roastDate', e.target.value)}
                    className="web3-ethereum-input w-full"
                  />
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
                    placeholder="Floral, Citrus, Chocolate"
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
                placeholder="Describe the coffee batch, its characteristics, and any special notes..."
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
                    Creating Batch...
                  </div>
                ) : (
                  'Create Retail Coffee Batch'
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
            Batch QR Codes Generated
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
              <p className="text-sm text-gray-600 mt-2">Contains full batch information and metadata</p>
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
              <p className="text-sm text-gray-600 mt-2">For quick batch verification</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
