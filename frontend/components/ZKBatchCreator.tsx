'use client';

import React, { useState } from 'react';
import { createBatchBlockchainFirst } from '../utils/smartContracts';
import { BatchCreationData } from '../utils/ipfsMetadata';

interface ZKBatchCreatorProps {
  onBatchCreated?: (result: any) => void;
}

export default function ZKBatchCreator({ onBatchCreated }: ZKBatchCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [zkEnabled, setZkEnabled] = useState(false);
  const [zkConfig, setZkConfig] = useState({
    enablePricePrivacy: false,
    enableQualityPrivacy: false,
    enableSupplyChainPrivacy: false,
    pricingClaim: 'Competitive pricing verified',
    qualityClaim: 'Premium quality standards met',
    supplyChainClaim: 'Ethical supply chain verified'
  });

  const [batchData, setBatchData] = useState({
    name: 'Premium Demo Coffee',
    description: 'Premium coffee with ZK privacy features',
    origin: 'Demo Origin',
    farmer: 'Demo Farmer',
    altitude: '1500m',
    process: 'Washed',
    certifications: ['Organic', 'Fair Trade'],
    cupping_notes: ['Chocolate', 'Berry', 'Citrus'],
    quantity: 100,
    packagingInfo: '60kg' as const,
    pricePerUnit: '25.50',
    productionDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    productType: 'GREEN_BEANS' as const,
    unitWeight: '60kg',
    moistureContent: 11.5,
    density: 0.7,
    defectCount: 2,
    cooperativeId: 'demo-coop-001',
    processorId: 'demo-proc-001'
  });

  const handleCreateBatch = async () => {
    setIsCreating(true);
    try {
      const result = await createBatchBlockchainFirst(
        batchData,
        zkEnabled ? zkConfig : undefined
      );
      
      console.log('✅ Batch created with ZK integration:', result);
      
      if (onBatchCreated) {
        onBatchCreated(result);
      }
      
      alert(`✅ Batch ${result.batchId} created successfully!${result.zkResults ? '\n🔐 ZK Privacy features enabled' : ''}`);
      
    } catch (error) {
      console.error('❌ Error creating batch:', error);
      alert(`❌ Error creating batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔐 ZK-Enhanced Batch Creator
      </h2>
      
      {/* Basic Batch Data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Batch Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coffee Name
            </label>
            <input
              type="text"
              value={batchData.name}
              onChange={(e) => setBatchData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farmer Name
            </label>
            <input
              type="text"
              value={batchData.farmer}
              onChange={(e) => setBatchData(prev => ({ ...prev, farmer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin
            </label>
            <input
              type="text"
              value={batchData.origin}
              onChange={(e) => setBatchData(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (bags)
            </label>
            <input
              type="number"
              value={batchData.quantity}
              onChange={(e) => setBatchData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Unit ($)
            </label>
            <input
              type="text"
              value={batchData.pricePerUnit}
              onChange={(e) => setBatchData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Method
            </label>
            <input
              type="text"
              value={batchData.process}
              onChange={(e) => setBatchData(prev => ({ ...prev, process: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ZK Privacy Configuration */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="zkEnabled"
            checked={zkEnabled}
            onChange={(e) => setZkEnabled(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="zkEnabled" className="text-lg font-semibold text-blue-800">
            🔐 Enable ZK Privacy Features
          </label>
        </div>

        {zkEnabled && (
          <div className="space-y-4">
            <h4 className="font-medium text-blue-700 mb-2">Privacy Options:</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="pricePrivacy"
                  checked={zkConfig.enablePricePrivacy}
                  onChange={(e) => setZkConfig(prev => ({ ...prev, enablePricePrivacy: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="pricePrivacy" className="font-medium text-blue-800">
                    💰 Price Privacy (Competitive Pricing)
                  </label>
                  <input
                    type="text"
                    value={zkConfig.pricingClaim}
                    onChange={(e) => setZkConfig(prev => ({ ...prev, pricingClaim: e.target.value }))}
                    placeholder="Pricing claim..."
                    className="mt-1 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="qualityPrivacy"
                  checked={zkConfig.enableQualityPrivacy}
                  onChange={(e) => setZkConfig(prev => ({ ...prev, enableQualityPrivacy: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="qualityPrivacy" className="font-medium text-blue-800">
                    ⭐ Quality Privacy (Standards Verification)
                  </label>
                  <input
                    type="text"
                    value={zkConfig.qualityClaim}
                    onChange={(e) => setZkConfig(prev => ({ ...prev, qualityClaim: e.target.value }))}
                    placeholder="Quality claim..."
                    className="mt-1 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="supplyChainPrivacy"
                  checked={zkConfig.enableSupplyChainPrivacy}
                  onChange={(e) => setZkConfig(prev => ({ ...prev, enableSupplyChainPrivacy: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="supplyChainPrivacy" className="font-medium text-blue-800">
                    🔗 Supply Chain Privacy (Provenance Verification)
                  </label>
                  <input
                    type="text"
                    value={zkConfig.supplyChainClaim}
                    onChange={(e) => setZkConfig(prev => ({ ...prev, supplyChainClaim: e.target.value }))}
                    placeholder="Supply chain claim..."
                    className="mt-1 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCreateBatch}
          disabled={isCreating}
          className={`px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 ${
            isCreating
              ? 'bg-gray-400 cursor-not-allowed'
              : zkEnabled
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isCreating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Creating Batch...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{zkEnabled ? '🔐' : '📦'}</span>
              <span>
                Create {zkEnabled ? 'Privacy-Enhanced' : 'Standard'} Batch
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Workflow Information:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Blockchain-first approach ensures data integrity</li>
          <li>• On-chain batch ID is the primary reference for all operations</li>
          <li>• ZK proofs are generated and stored on-chain for privacy claims</li>
          <li>• Database sync happens after blockchain confirmation (non-blocking)</li>
          <li>• IPFS stores metadata with privacy configuration details</li>
        </ul>
      </div>
    </div>
  );
}
