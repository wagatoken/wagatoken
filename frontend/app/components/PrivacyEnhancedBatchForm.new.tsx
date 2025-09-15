'use client';

import React, { useState } from 'react';
import { useWallet } from '../components/WalletProvider';

interface SensitiveData {
  pricing?: {
    actualCost: number;
    profitMargin: number;
    supplierPayment: number;
  };
  quality?: {
    defectRate: number;
    moistureContent: number;
    gradingNotes: string;
  };
  supplyChain?: {
    farmerIdentity: string;
    paymentTerms: string;
    certificationDetails: string;
  };
}

interface PrivacyConfig {
  pricingPrivate: boolean;
  qualityPrivate: boolean;
  supplyChainPrivate: boolean;
  sensitiveData: SensitiveData;
}

interface BatchFormData {
  // Standard batch fields
  productionDate: string;
  expiryDate: string;
  quantity: number;
  pricePerUnit: number;
  origin: string;
  packagingInfo: string;
  unitWeight: string;
  productType: 'GREEN_BEANS' | 'ROASTED_BEANS' | 'RETAIL_BAGS';
  
  // Extended fields based on product type
  moistureContent?: number;
  density?: number;
  defectCount?: number;
  cooperativeId?: string;
  processorId?: string;
  
  // Privacy configuration
  privacyConfig: PrivacyConfig;
}

interface PrivacyEnhancedBatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  userRole: 'ADMIN' | 'PROCESSOR' | 'COOPERATIVE' | 'ROASTER';
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
    origin: '',
    packagingInfo: '',
    unitWeight: '60kg',
    productType: userRole === 'COOPERATIVE' ? 'GREEN_BEANS' : 
                 userRole === 'PROCESSOR' ? 'ROASTED_BEANS' : 'RETAIL_BAGS',
    privacyConfig: {
      pricingPrivate: true,
      qualityPrivate: true,
      supplyChainPrivate: true,
      sensitiveData: {
        pricing: {
          actualCost: 0,
          profitMargin: 0,
          supplierPayment: 0
        },
        quality: {
          defectRate: 0,
          moistureContent: 0,
          gradingNotes: ''
        },
        supplyChain: {
          farmerIdentity: '',
          paymentTerms: '',
          certificationDetails: ''
        }
      }
    }
  });

  const [showSensitiveData, setShowSensitiveData] = useState(false);

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

  const handleSensitiveDataChange = (
    category: keyof SensitiveData,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      privacyConfig: {
        ...prev.privacyConfig,
        sensitiveData: {
          ...prev.privacyConfig.sensitiveData,
          [category]: {
            ...prev.privacyConfig.sensitiveData[category],
            [field]: value
          }
        }
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.productionDate || !formData.expiryDate || !formData.origin) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate privacy configuration
    const { privacyConfig } = formData;
    if (privacyConfig.pricingPrivate && !privacyConfig.sensitiveData.pricing?.actualCost) {
      alert('Please provide pricing sensitive data or disable pricing privacy');
      return;
    }

    onSubmit(formData);
  };

  const getDefaultQuantity = () => {
    switch (formData.productType) {
      case 'GREEN_BEANS':
      case 'ROASTED_BEANS':
        return 60; // 60kg bags
      case 'RETAIL_BAGS':
        return 100; // 100 units
      default:
        return 0;
    }
  };

  const getPackagingOptions = () => {
    switch (formData.productType) {
      case 'GREEN_BEANS':
      case 'ROASTED_BEANS':
        return ['60kg bags', '30kg bags', '25kg bags'];
      case 'RETAIL_BAGS':
        return ['250g', '500g', '1kg'];
      default:
        return ['250g'];
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Privacy-Enhanced Coffee Batch
        </h2>
        <p className="text-gray-600">
          Create a coffee batch with advanced privacy controls and zero-knowledge proofs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Batch Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Origin *
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Yirgacheffe, Ethiopia"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GREEN_BEANS">Green Coffee Beans</option>
                <option value="ROASTED_BEANS">Roasted Coffee Beans</option>
                <option value="RETAIL_BAGS">Retail Coffee Bags</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Default: ${getDefaultQuantity()}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Unit (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerUnit || ''}
                onChange={(e) => handleInputChange('pricePerUnit', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Info
              </label>
              <select
                value={formData.packagingInfo}
                onChange={(e) => handleInputChange('packagingInfo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getPackagingOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Weight
              </label>
              <input
                type="text"
                value={formData.unitWeight}
                onChange={(e) => handleInputChange('unitWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60kg"
              />
            </div>
          </div>
        </div>

        {/* Privacy Configuration */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Privacy Configuration</h3>
            <span className="text-sm text-gray-600">Enable privacy for sensitive data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Pricing Privacy
                </label>
                <input
                  type="checkbox"
                  checked={formData.privacyConfig.pricingPrivate}
                  onChange={(e) => handlePrivacyConfigChange('pricingPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-600">
                Hide actual costs, profit margins, and supplier payments
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Quality Privacy
                </label>
                <input
                  type="checkbox"
                  checked={formData.privacyConfig.qualityPrivate}
                  onChange={(e) => handlePrivacyConfigChange('qualityPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-600">
                Hide defect rates, moisture content, and internal grading notes
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Supply Chain Privacy
                </label>
                <input
                  type="checkbox"
                  checked={formData.privacyConfig.supplyChainPrivate}
                  onChange={(e) => handlePrivacyConfigChange('supplyChainPrivate', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </div>
              <p className="text-xs text-gray-600">
                Hide farmer identity, payment terms, and certification details
              </p>
            </div>
          </div>
        </div>

        {/* Sensitive Data Collection */}
        {(formData.privacyConfig.pricingPrivate || 
          formData.privacyConfig.qualityPrivate || 
          formData.privacyConfig.supplyChainPrivate) && (
          <div className="border-b pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sensitive Data</h3>
              <button
                type="button"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showSensitiveData ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showSensitiveData && (
              <div className="space-y-6">
                {/* Pricing Sensitive Data */}
                {formData.privacyConfig.pricingPrivate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Pricing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Actual Cost (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.privacyConfig.sensitiveData.pricing?.actualCost || ''}
                          onChange={(e) => handleSensitiveDataChange('pricing', 'actualCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profit Margin (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.privacyConfig.sensitiveData.pricing?.profitMargin || ''}
                          onChange={(e) => handleSensitiveDataChange('pricing', 'profitMargin', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supplier Payment (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.privacyConfig.sensitiveData.pricing?.supplierPayment || ''}
                          onChange={(e) => handleSensitiveDataChange('pricing', 'supplierPayment', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quality Sensitive Data */}
                {formData.privacyConfig.qualityPrivate && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Quality Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Defect Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.privacyConfig.sensitiveData.quality?.defectRate || ''}
                          onChange={(e) => handleSensitiveDataChange('quality', 'defectRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Moisture Content (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.privacyConfig.sensitiveData.quality?.moistureContent || ''}
                          onChange={(e) => handleSensitiveDataChange('quality', 'moistureContent', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grading Notes
                        </label>
                        <input
                          type="text"
                          value={formData.privacyConfig.sensitiveData.quality?.gradingNotes || ''}
                          onChange={(e) => handleSensitiveDataChange('quality', 'gradingNotes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Internal quality notes"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Supply Chain Sensitive Data */}
                {formData.privacyConfig.supplyChainPrivate && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Supply Chain Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farmer Identity
                        </label>
                        <input
                          type="text"
                          value={formData.privacyConfig.sensitiveData.supplyChain?.farmerIdentity || ''}
                          onChange={(e) => handleSensitiveDataChange('supplyChain', 'farmerIdentity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Farmer name or ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Terms
                        </label>
                        <input
                          type="text"
                          value={formData.privacyConfig.sensitiveData.supplyChain?.paymentTerms || ''}
                          onChange={(e) => handleSensitiveDataChange('supplyChain', 'paymentTerms', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Payment terms"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certification Details
                        </label>
                        <input
                          type="text"
                          value={formData.privacyConfig.sensitiveData.supplyChain?.certificationDetails || ''}
                          onChange={(e) => handleSensitiveDataChange('supplyChain', 'certificationDetails', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Certification details"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Pricing:</strong> {formData.privacyConfig.pricingPrivate ? 'Private (ZK Proof)' : 'Public'}</p>
            </div>
            <div>
              <p><strong>Quality:</strong> {formData.privacyConfig.qualityPrivate ? 'Private (ZK Proof)' : 'Public'}</p>
            </div>
            <div>
              <p><strong>Supply Chain:</strong> {formData.privacyConfig.supplyChainPrivate ? 'Private (ZK Proof)' : 'Public'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Note:</strong> Private data will be encrypted and only verifiable through zero-knowledge proofs. 
            IPFS metadata and ZK proof hashes will be automatically generated.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Batch...' : 'Create Privacy-Enhanced Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacyEnhancedBatchForm;
