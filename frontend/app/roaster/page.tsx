'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdInventory, MdLocalFireDepartment, MdStore } from 'react-icons/md';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR } from '../../utils/ipfsMetadata';

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
  packagingInfo: string; // 60kg
  unitWeight: string; // 60kg
  pricePerUnit: string;
  productionDate: Date;
  expiryDate: Date;

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
  const { account, signer, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasRoasterRole, setHasRoasterRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);

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
    packagingInfo: '60kg',
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

  // Generated QR codes
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Check roaster role on component mount
  useEffect(() => {
    checkRoasterRole();
  }, [account, signer, isConnected]);

  const checkRoasterRole = async () => {
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

      // Check if user has ROASTER_ROLE
      const roasterRole = await coffeeTokenContract.ROASTER_ROLE();
      const hasRole = await coffeeTokenContract.hasRole(roasterRole, account);

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
    if (!isConnected || !signer || !hasRoasterRole) {
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

      // Create batch using blockchain-first workflow
      const result = await createBatchBlockchainFirst({
        ...batchForm,
        productType: 'ROASTED_BEANS', // Roasters create roasted beans
        processorId: batchForm.processorId
      });

      setSuccess(`Roasted bean batch created successfully! Batch ID: ${result.batchId}`);

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
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: '60kg',
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
          <span className="ml-3 text-gray-600">Checking roaster permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
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

  if (!hasRoasterRole) {
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
              <MdLocalFireDepartment size={32} className="text-orange-600" />
              Roaster Portal
            </h1>
            <p className="text-gray-600">
              Create and manage roasted coffee bean batches for supply chain partners
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Connected as Roaster</div>
            <div className="text-xs text-gray-400 font-mono">{account}</div>
          </div>
        </div>
      </div>

      {/* Batch Creation Form */}
      <div className="web3-premium-card animate-card-entrance">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Roasted Bean Batch</h2>

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
            {/* Roaster Information */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdStore size={20} />
                Roaster Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="web3-form-label">
                    Roaster Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.processorName}
                    onChange={(e) => handleInputChange('processorName', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="e.g., Artisan Coffee Roasters"
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
                    placeholder="e.g., Portland, Oregon"
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Roaster Ethereum Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={batchForm.processorId}
                    onChange={(e) => handleInputChange('processorId', e.target.value)}
                    className="web3-ethereum-input w-full"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="web3-form-label">
                    Roasting Method
                  </label>
                  <select
                    value={batchForm.roastMethod}
                    onChange={(e) => handleInputChange('roastMethod', e.target.value)}
                    className="web3-ethereum-input w-full"
                  >
                    <option value="Drum">Drum Roaster</option>
                    <option value="Fluid Bed">Fluid Bed</option>
                    <option value="Hot Air">Hot Air</option>
                    <option value="Probat">Probat Probatino</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Green Bean Information */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdCoffee size={20} />
                Green Bean Information
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
                    placeholder="e.g., Ethiopian Yirgacheffe Roasted Beans"
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
                    placeholder="e.g., Local Cooperative"
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
                      placeholder="4.50"
                      min="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="web3-form-label">
                      Roast Date <span className="text-red-500">*</span>
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

            {/* Roasting Specifications */}
            <div className="web3-form-section">
              <h3 className="flex items-center gap-2 mb-4">
                <MdLocalFireDepartment size={20} />
                Roasting Specifications
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="web3-form-label">
                      Roast Profile <span className="text-red-500">*</span>
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
                      <option value="French">French</option>
                      <option value="Italian">Italian</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="web3-form-label">
                      Roast Degree
                    </label>
                    <select
                      value={batchForm.roastDegree}
                      onChange={(e) => handleInputChange('roastDegree', e.target.value)}
                      className="web3-ethereum-input w-full"
                    >
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Dark">Dark</option>
                    </select>
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
                    placeholder="Floral, Citrus, Chocolate, Caramel"
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
                placeholder="Describe the roasted bean batch, roasting process, flavor profile, and any special notes..."
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
                    Creating Roasted Bean Batch...
                  </div>
                ) : (
                  'Create Roasted Bean Batch'
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
            Roasted Bean Batch QR Codes Generated
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
              <p className="text-sm text-gray-600 mt-2">Contains full roasted bean batch information and metadata</p>
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
              <p className="text-sm text-gray-600 mt-2">For quick roasted bean batch verification</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
