'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../components/WalletProvider';

interface PrivacyConfig {
  pricingSelective: number; // 0=Public, 1=Selective, 2=Private
  qualitySelective: number;
  supplyChainSelective: number;
  pricingProofHash: string;
  qualityProofHash: string;
  supplyChainProofHash: string;
  pricingPrivate: boolean;
  qualityPrivate: boolean;
  supplyChainPrivate: boolean;
  level: number; // 0=Public, 1=Selective, 2=Private
}

interface BatchFormData {
  productionDate: string;
  expiryDate: string;
  quantity: number;
  pricePerUnit: number;
  packagingInfo: string;
  metadataHash: string;
  zkProofHash: string;
  encryptedDataHash: string;
  privacyConfig: PrivacyConfig;
}

interface PrivacyEnhancedBatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  userRole: 'ADMIN' | 'PROCESSOR';
  isSubmitting?: boolean;
}

const PrivacyEnhancedBatchForm: React.FC<PrivacyEnhancedBatchFormProps> = ({
  onSubmit,
  userRole,
  isSubmitting = false
}) => {
  const { address } = useWallet();
  const [formData, setFormData] = useState<BatchFormData>({
    productionDate: '',
    expiryDate: '',
    quantity: 0,
    pricePerUnit: 0,
    packagingInfo: '250g',
    metadataHash: '',
    zkProofHash: '',
    encryptedDataHash: '',
    privacyConfig: {
      pricingSelective: 1, // Default to Selective
      qualitySelective: 1,
      supplyChainSelective: 1,
      pricingProofHash: '',
      qualityProofHash: '',
      supplyChainProofHash: '',
      pricingPrivate: true,
      qualityPrivate: true,
      supplyChainPrivate: true,
      level: 1
    }
  });

  const [privacyLevel, setPrivacyLevel] = useState<'PUBLIC' | 'SELECTIVE' | 'PRIVATE'>('SELECTIVE');
  const [showAdvancedPrivacy, setShowAdvancedPrivacy] = useState(false);
  const [zkProofs, setZkProofs] = useState({
    price: '',
    quality: '',
    supplyChain: ''
  });

  // Update privacy config when privacy level changes
  useEffect(() => {
    const level = privacyLevel === 'PUBLIC' ? 0 : privacyLevel === 'SELECTIVE' ? 1 : 2;
    const isPrivate = privacyLevel === 'PRIVATE';
    
    setFormData(prev => ({
      ...prev,
      privacyConfig: {
        ...prev.privacyConfig,
        pricingSelective: level,
        qualitySelective: level,
        supplyChainSelective: level,
        pricingPrivate: isPrivate,
        qualityPrivate: isPrivate,
        supplyChainPrivate: isPrivate,
        level
      }
    }));
  }, [privacyLevel]);

  const handleInputChange = (field: keyof BatchFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyConfigChange = (field: keyof PrivacyConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacyConfig: {
        ...prev.privacyConfig,
        [field]: value
      }
    }));
  };

  const handleZKProofChange = (type: 'price' | 'quality' | 'supplyChain', value: string) => {
    setZkProofs(prev => ({
      ...prev,
      [type]: value
    }));

    // Update privacy config with proof hashes
    const proofHash = value ? ethers.keccak256(ethers.toUtf8Bytes(value)) : '';
    handlePrivacyConfigChange(`${type}ProofHash` as keyof PrivacyConfig, proofHash);
  };

  const generateZKProof = async (type: 'price' | 'quality' | 'supplyChain') => {
    try {
      // Simulate ZK proof generation
      const proofData = `${type}_proof_${Date.now()}_${Math.random()}`;
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofData));
      
      setZkProofs(prev => ({
        ...prev,
        [type]: proofData
      }));

      handlePrivacyConfigChange(`${type}ProofHash` as keyof PrivacyConfig, proofHash);
      
      console.log(`Generated ${type} ZK proof:`, proofHash);
    } catch (error) {
      console.error(`Error generating ${type} ZK proof:`, error);
    }
  };

  const encryptSensitiveData = async () => {
    try {
      // Simulate data encryption
      const sensitiveData = {
        price: formData.pricePerUnit,
        quality: 'high_quality_metrics',
        supplyChain: 'detailed_supply_chain_info'
      };
      
      const encryptedData = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(sensitiveData)));
      handleInputChange('encryptedDataHash', encryptedData);
      
      console.log('Encrypted sensitive data:', encryptedData);
    } catch (error) {
      console.error('Error encrypting data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    // Validate form data
    if (!formData.productionDate || !formData.expiryDate || formData.quantity <= 0 || formData.pricePerUnit <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert dates to timestamps
    const productionTimestamp = Math.floor(new Date(formData.productionDate).getTime() / 1000);
    const expiryTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000);

    const submitData = {
      ...formData,
      productionDate: productionTimestamp.toString(),
      expiryDate: expiryTimestamp.toString()
    };

    onSubmit(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Privacy-Enhanced Coffee Batch
        </h2>
        <p className="text-gray-600">
          {userRole === 'PROCESSOR' 
            ? 'Create a new coffee batch with maximum privacy protection for your sensitive business data.'
            : 'Create a new coffee batch with configurable privacy settings.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Batch Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Date *
            </label>
            <input
              type="date"
              value={formData.productionDate}
              onChange={(e) => handleInputChange('productionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of coffee bags"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Unit (wei) *
            </label>
            <input
              type="number"
              value={formData.pricePerUnit}
              onChange={(e) => handleInputChange('pricePerUnit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Price in wei"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Packaging Info *
            </label>
            <select
              value={formData.packagingInfo}
              onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="250g">250g</option>
              <option value="500g">500g</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPFS Metadata Hash
            </label>
            <input
              type="text"
              value={formData.metadataHash}
              onChange={(e) => handleInputChange('metadataHash', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Qm..."
            />
          </div>
        </div>

        {/* Privacy Configuration */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy Configuration</h3>
            <button
              type="button"
              onClick={() => setShowAdvancedPrivacy(!showAdvancedPrivacy)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showAdvancedPrivacy ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Level
              </label>
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value as 'PUBLIC' | 'SELECTIVE' | 'PRIVATE')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PUBLIC">Public - All data visible</option>
                <option value="SELECTIVE">Selective - Role-based access</option>
                <option value="PRIVATE">Private - ZK proofs only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZK Proof Hash
              </label>
              <input
                type="text"
                value={formData.zkProofHash}
                onChange={(e) => handleInputChange('zkProofHash', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encrypted Data Hash
              </label>
              <input
                type="text"
                value={formData.encryptedDataHash}
                onChange={(e) => handleInputChange('encryptedDataHash', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
          </div>

          {showAdvancedPrivacy && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Advanced Privacy Settings</h4>
              
              {/* ZK Proofs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ZK Proof
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={zkProofs.price}
                      onChange={(e) => handleZKProofChange('price', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price proof data"
                    />
                    <button
                      type="button"
                      onClick={() => generateZKProof('price')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality ZK Proof
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={zkProofs.quality}
                      onChange={(e) => handleZKProofChange('quality', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quality proof data"
                    />
                    <button
                      type="button"
                      onClick={() => generateZKProof('quality')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supply Chain ZK Proof
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={zkProofs.supplyChain}
                      onChange={(e) => handleZKProofChange('supplyChain', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Supply chain proof data"
                    />
                    <button
                      type="button"
                      onClick={() => generateZKProof('supplyChain')}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.privacyConfig.pricingPrivate}
                      onChange={(e) => handlePrivacyConfigChange('pricingPrivate', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Price Data</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.privacyConfig.qualityPrivate}
                      onChange={(e) => handlePrivacyConfigChange('qualityPrivate', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Quality Data</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.privacyConfig.supplyChainPrivate}
                      onChange={(e) => handlePrivacyConfigChange('supplyChainPrivate', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Supply Chain Data</span>
                  </label>
                </div>
              </div>

              {/* Privacy Actions */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={encryptSensitiveData}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Encrypt Sensitive Data
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    generateZKProof('price');
                    generateZKProof('quality');
                    generateZKProof('supplyChain');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Generate All ZK Proofs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Privacy Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Privacy Level:</strong> {privacyLevel}</p>
            <p>• <strong>Price Visibility:</strong> {formData.privacyConfig.pricingPrivate ? 'Hidden' : 'Visible'}</p>
            <p>• <strong>Quality Visibility:</strong> {formData.privacyConfig.qualityPrivate ? 'Hidden' : 'Visible'}</p>
            <p>• <strong>Supply Chain Visibility:</strong> {formData.privacyConfig.supplyChainPrivate ? 'Hidden' : 'Visible'}</p>
            <p>• <strong>ZK Proofs:</strong> {Object.values(zkProofs).some(p => p) ? 'Generated' : 'Not Generated'}</p>
            <p>• <strong>Encrypted Data:</strong> {formData.encryptedDataHash ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Batch...' : 'Create Privacy-Enhanced Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacyEnhancedBatchForm;
