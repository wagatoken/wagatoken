'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MdCoffee, MdLocationOn, MdGrade, MdVerified, MdRefresh, MdInfo, MdQrCode, MdInventory, MdAgriculture, MdNature } from 'react-icons/md';
import { useWallet } from '../components/WalletProvider';
import { createBatchBlockchainFirst } from '../../utils/smartContracts';
import { generateBatchQRCode, generateSimpleVerificationQR, CoffeeBatchMetadata } from '../../utils/ipfsMetadata';

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
  const { address, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasCooperativeRole, setHasCooperativeRole] = useState(false);
  const [roleChecking, setRoleChecking] = useState(true);

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

  if (roleChecking) {
    return (
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Checking cooperative permissions...</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
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

  if (!hasCooperativeRole) {
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="web3-premium-card animate-card-entrance">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MdNature size={32} className="text-green-600" />
              Cooperatives Portal
            </h1>
            <p className="text-gray-600">
              Create and manage green coffee bean batches for supply chain partners
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Connected as Cooperative</div>
            <div className="text-xs text-gray-400 font-mono">{address}</div>
          </div>
        </div>
      </div>

      {/* Batch Creation Form */}
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
  );
}
