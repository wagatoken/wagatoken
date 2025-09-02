'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

interface PrivacyConfig {
  pricingSelective: number;
  qualitySelective: number;
  supplyChainSelective: number;
  pricingProofHash: string;
  qualityProofHash: string;
  supplyChainProofHash: string;
  pricingPrivate: boolean;
  qualityPrivate: boolean;
  supplyChainPrivate: boolean;
  level: number;
}

interface BatchData {
  batchId: number;
  productionDate: number;
  expiryDate: number;
  isVerified: boolean;
  quantity: number;
  mintedQuantity: number;
  pricePerUnit: number;
  packagingInfo: string;
  metadataHash: string;
  isMetadataVerified: boolean;
  lastVerifiedTimestamp: number;
  zkProofHash: string;
  encryptedDataHash: string;
  privacyConfig: PrivacyConfig;
}

interface ZKProof {
  proofHash: string;
  proofData: string;
  proofTimestamp: number;
  proofGenerator: string;
  isValid: boolean;
  proofType: string;
}

interface EncryptedData {
  dataHash: string;
  encryptedData: string;
  encryptionKeyHash: string;
  encryptionTimestamp: number;
  dataOwner: string;
  isAccessible: boolean;
}

interface PrivacyEnhancedBatchViewerProps {
  batchData: BatchData;
  userRole: 'ADMIN' | 'PROCESSOR' | 'DISTRIBUTOR' | 'PUBLIC';
  onRequestBatch?: (batchId: number, quantity: number, details: string) => void;
  onViewZKProof?: (batchId: number) => void;
  onDecryptData?: (batchId: number, encryptionKey: string) => void;
}

const PrivacyEnhancedBatchViewer: React.FC<PrivacyEnhancedBatchViewerProps> = ({
  batchData,
  userRole,
  onRequestBatch,
  onViewZKProof,
  onDecryptData
}) => {
  const { address } = useAccount();
  const [showZKProofs, setShowZKProofs] = useState(false);
  const [showEncryptedData, setShowEncryptedData] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [isRequesting, setIsRequesting] = useState(false);

  // Determine what data is visible based on user role and privacy settings
  const getVisibleData = () => {
    const data: any = {
      batchId: batchData.batchId,
      productionDate: new Date(batchData.productionDate * 1000).toLocaleDateString(),
      expiryDate: new Date(batchData.expiryDate * 1000).toLocaleDateString(),
      isVerified: batchData.isVerified,
      quantity: batchData.quantity,
      packagingInfo: batchData.packagingInfo,
      metadataHash: batchData.metadataHash,
      isMetadataVerified: batchData.isMetadataVerified,
      lastVerifiedTimestamp: new Date(batchData.lastVerifiedTimestamp * 1000).toLocaleDateString(),
      hasZKProofs: batchData.zkProofHash !== '',
      hasEncryptedData: batchData.encryptedDataHash !== '',
      mintedQuantity: batchData.mintedQuantity,
      availableQuantity: batchData.quantity - batchData.mintedQuantity
    };

    // Price visibility based on role and privacy settings
    if (userRole === 'ADMIN' || userRole === 'PROCESSOR') {
      data.pricePerUnit = batchData.pricePerUnit;
      data.priceVisible = true;
      data.priceDisplay = `${batchData.pricePerUnit} wei`;
    } else if (userRole === 'DISTRIBUTOR' && !batchData.privacyConfig.pricingPrivate) {
      data.pricePerUnit = batchData.pricePerUnit;
      data.priceVisible = true;
      data.priceDisplay = `${batchData.pricePerUnit} wei`;
    } else {
      // Check if selective privacy is enabled and we have ZK proof data
      if (batchData.privacyConfig.pricingSelective === 1 && batchData.zkProofHash) {
        // For selective privacy, show indicative price range based on market segment
        // When Agent Kit is implemented, this will use real ZK proof data to determine market segment
        // For now, we show premium tier range as default for selective privacy
        data.priceDisplay = 'Premium Tier: $15-50 (Indicative Range)';
        data.priceRange = { min: 15, max: 50 };
        data.marketSegment = 'premium';
      } else if (batchData.privacyConfig.pricingSelective === 2) {
        // Mid-market selective privacy
        data.priceDisplay = 'Mid-Market: $8-25 (Indicative Range)';
        data.priceRange = { min: 8, max: 25 };
        data.marketSegment = 'mid-market';
      } else if (batchData.privacyConfig.pricingSelective === 3) {
        // Value tier selective privacy
        data.priceDisplay = 'Value Tier: $3-15 (Indicative Range)';
        data.priceRange = { min: 3, max: 15 };
        data.marketSegment = 'value';
      } else {
        data.priceDisplay = 'Pricing Information Hidden';
      }
      data.priceVisible = false;
    }

    return data;
  };

  const visibleData = getVisibleData();

  const handleRequestBatch = async () => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    if (!requestDetails.trim()) {
      alert('Please provide request details');
      return;
    }

    if (requestQuantity <= 0) {
      alert('Please specify a valid quantity');
      return;
    }

    if (requestQuantity > batchData.quantity) {
      alert('Requested quantity cannot exceed batch quantity');
      return;
    }

    setIsRequesting(true);
    try {
      if (onRequestBatch) {
        await onRequestBatch(batchData.batchId, requestQuantity, requestDetails);
      }
      setRequestDetails('');
      setRequestQuantity(1);
    } catch (error) {
      console.error('Error requesting batch:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleViewZKProof = () => {
    if (onViewZKProof) {
      onViewZKProof(batchData.batchId);
    }
    setShowZKProofs(!showZKProofs);
  };

  const handleDecryptData = () => {
    if (!encryptionKey.trim()) {
      alert('Please provide encryption key');
      return;
    }

    if (onDecryptData) {
      onDecryptData(batchData.batchId, encryptionKey);
    }
    setShowEncryptedData(!showEncryptedData);
  };

  const getPrivacyLevelText = (level: number) => {
    switch (level) {
      case 0: return 'Public';
      case 1: return 'Selective';
      case 2: return 'Private';
      default: return 'Unknown';
    }
  };

  const getPrivacyIcon = (level: number) => {
    switch (level) {
      case 0: return '🌐';
      case 1: return '🔒';
      case 2: return '🔐';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coffee Batch #{batchData.batchId}
          </h2>
          <p className="text-gray-600">
            {getPrivacyIcon(batchData.privacyConfig.level)} Privacy Level: {getPrivacyLevelText(batchData.privacyConfig.level)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {batchData.isVerified && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Verified
            </span>
          )}
          {batchData.isMetadataVerified && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              ✓ Metadata Verified
            </span>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Production Date</label>
            <p className="text-gray-900">{visibleData.productionDate}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <p className="text-gray-900">{visibleData.expiryDate}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <p className="text-gray-900">{visibleData.quantity} bags</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Packaging</label>
            <p className="text-gray-900">{visibleData.packagingInfo}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Information</label>
            <div className="flex items-center">
              <p className={`text-gray-900 ${visibleData.priceVisible ? '' : 'text-gray-500 italic'}`}>
                {visibleData.priceDisplay || 'Pricing Information Hidden'}
              </p>
              {!visibleData.priceVisible && visibleData.priceRange && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Indicative Range
                </span>
              )}
              {!visibleData.priceVisible && !visibleData.priceRange && (
                <span className="ml-2 text-xs text-gray-500">
                  (Private)
                </span>
              )}
            </div>
            {visibleData.priceRange && (
              <p className="text-xs text-gray-600 mt-1">
                Range: ${visibleData.priceRange.min} - ${visibleData.priceRange.max} per unit
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Verified</label>
            <p className="text-gray-900">{visibleData.lastVerifiedTimestamp}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metadata Hash</label>
            <p className="text-gray-900 font-mono text-sm break-all">{visibleData.metadataHash || 'Not set'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${visibleData.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {visibleData.isVerified ? 'Verified' : 'Not Verified'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${visibleData.isMetadataVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {visibleData.isMetadataVerified ? 'Metadata OK' : 'Metadata Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="border-t pt-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Price Privacy</h4>
            <div className="space-y-1 text-sm">
              <p>Level: {getPrivacyLevelText(batchData.privacyConfig.pricingSelective)}</p>
              <p>Hidden: {batchData.privacyConfig.pricingPrivate ? 'Yes' : 'No'}</p>
              <p>ZK Proof: {batchData.privacyConfig.pricingProofHash ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Quality Privacy</h4>
            <div className="space-y-1 text-sm">
              <p>Level: {getPrivacyLevelText(batchData.privacyConfig.qualitySelective)}</p>
              <p>Hidden: {batchData.privacyConfig.qualityPrivate ? 'Yes' : 'No'}</p>
              <p>ZK Proof: {batchData.privacyConfig.qualityProofHash ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Supply Chain Privacy</h4>
            <div className="space-y-1 text-sm">
              <p>Level: {getPrivacyLevelText(batchData.privacyConfig.supplyChainSelective)}</p>
              <p>Hidden: {batchData.privacyConfig.supplyChainPrivate ? 'Yes' : 'No'}</p>
              <p>ZK Proof: {batchData.privacyConfig.supplyChainProofHash ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ZK Proofs Section */}
      {visibleData.hasZKProofs && (
        <div className="border-t pt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Zero-Knowledge Proofs</h3>
            <button
              onClick={handleViewZKProof}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              {showZKProofs ? 'Hide Proofs' : 'View Proofs'}
            </button>
          </div>
          
          {showZKProofs && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {batchData.privacyConfig.pricingProofHash && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Price Proof</h4>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {batchData.privacyConfig.pricingProofHash}
                    </p>
                  </div>
                )}
                
                {batchData.privacyConfig.qualityProofHash && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Quality Proof</h4>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {batchData.privacyConfig.qualityProofHash}
                    </p>
                  </div>
                )}
                
                {batchData.privacyConfig.supplyChainProofHash && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supply Chain Proof</h4>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {batchData.privacyConfig.supplyChainProofHash}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encrypted Data Section */}
      {visibleData.hasEncryptedData && (
        <div className="border-t pt-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Encrypted Data</h3>
            <button
              onClick={handleDecryptData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              {showEncryptedData ? 'Hide Data' : 'Decrypt Data'}
            </button>
          </div>
          
          {showEncryptedData && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Key
                </label>
                <input
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter encryption key"
                />
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Encrypted Data Hash</h4>
                <p className="text-sm text-gray-600 font-mono break-all">
                  {batchData.encryptedDataHash}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Request Section (for Distributors) */}
      {userRole === 'DISTRIBUTOR' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Batch</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Request
              </label>
              <input
                type="number"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={batchData.quantity}
                placeholder={`Max: ${batchData.quantity}`}
              />
              <p className="text-sm text-gray-500 mt-1">
                Available: {visibleData.availableQuantity} units (Total: {batchData.quantity}, Minted: {visibleData.mintedQuantity})
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Details
              </label>
              <textarea
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your request (delivery address, special requirements, etc.)"
              />
            </div>
            
            <button
              onClick={handleRequestBatch}
              disabled={isRequesting || !requestDetails.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? 'Requesting...' : 'Request Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Access Control Information */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Your Role: {userRole}</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• Price Data: {visibleData.priceVisible ? 'Visible' : 'Hidden'}</p>
              <p>• Quality Data: {userRole === 'ADMIN' || userRole === 'PROCESSOR' ? 'Visible' : 'Hidden'}</p>
              <p>• Supply Chain Data: {userRole === 'ADMIN' || userRole === 'PROCESSOR' ? 'Visible' : 'Hidden'}</p>
              <p>• ZK Proofs: {visibleData.hasZKProofs ? 'Accessible' : 'Not Available'}</p>
              <p>• Encrypted Data: {visibleData.hasEncryptedData ? 'Accessible' : 'Not Available'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Privacy Summary</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <p>• Overall Privacy: {getPrivacyLevelText(batchData.privacyConfig.level)}</p>
              <p>• ZK Proofs: {visibleData.hasZKProofs ? 'Enabled' : 'Disabled'}</p>
              <p>• Encryption: {visibleData.hasEncryptedData ? 'Enabled' : 'Disabled'}</p>
              <p>• Selective Transparency: {batchData.privacyConfig.level === 1 ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyEnhancedBatchViewer;
