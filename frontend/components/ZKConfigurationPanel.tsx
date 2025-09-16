'use client';

import React from 'react';

export interface ZKConfig {
  enablePricePrivacy: boolean;
  enableQualityPrivacy: boolean;
  enableSupplyChainPrivacy: boolean;
  pricingClaim: string;
  qualityClaim: string;
  supplyChainClaim: string;
}

interface ZKConfigurationPanelProps {
  zkConfig: ZKConfig;
  onConfigChange: (config: ZKConfig) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  className?: string;
}

export default function ZKConfigurationPanel({
  zkConfig,
  onConfigChange,
  enabled,
  onEnabledChange,
  className = ''
}: ZKConfigurationPanelProps) {
  const updateConfig = (updates: Partial<ZKConfig>) => {
    onConfigChange({ ...zkConfig, ...updates });
  };

  return (
    <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      {/* Main Toggle */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="zkEnabled"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="zkEnabled" className="text-lg font-semibold text-blue-800">
          🔐 Enable ZK Privacy Features
        </label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-6">
          <div className="mb-3">
            <p className="text-sm text-blue-700 mb-3">
              Zero-Knowledge proofs enable privacy-preserving verification of claims without revealing sensitive data.
            </p>
          </div>

          {/* Price Privacy */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="pricePrivacy"
              checked={zkConfig.enablePricePrivacy}
              onChange={(e) => updateConfig({ enablePricePrivacy: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="pricePrivacy" className="font-medium text-blue-800 flex items-center">
                💰 Price Competitiveness Privacy
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  PricePrivacyCircuit
                </span>
              </label>
              <p className="text-xs text-blue-600 mt-1">
                Prove pricing is competitive without revealing exact amounts
              </p>
              {zkConfig.enablePricePrivacy && (
                <input
                  type="text"
                  value={zkConfig.pricingClaim}
                  onChange={(e) => updateConfig({ pricingClaim: e.target.value })}
                  placeholder="e.g., 'Competitive market pricing verified'"
                  className="mt-2 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Quality Privacy */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="qualityPrivacy"
              checked={zkConfig.enableQualityPrivacy}
              onChange={(e) => updateConfig({ enableQualityPrivacy: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="qualityPrivacy" className="font-medium text-blue-800 flex items-center">
                ⭐ Quality Standards Privacy
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  QualityTierCircuit
                </span>
              </label>
              <p className="text-xs text-blue-600 mt-1">
                Verify quality meets standards without exposing detailed scores
              </p>
              {zkConfig.enableQualityPrivacy && (
                <input
                  type="text"
                  value={zkConfig.qualityClaim}
                  onChange={(e) => updateConfig({ qualityClaim: e.target.value })}
                  placeholder="e.g., 'Premium quality standards verified'"
                  className="mt-2 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Supply Chain Privacy */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="supplyChainPrivacy"
              checked={zkConfig.enableSupplyChainPrivacy}
              onChange={(e) => updateConfig({ enableSupplyChainPrivacy: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="supplyChainPrivacy" className="font-medium text-blue-800 flex items-center">
                🔗 Supply Chain Provenance Privacy
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  SupplyChainPrivacyCircuit
                </span>
              </label>
              <p className="text-xs text-blue-600 mt-1">
                Prove ethical sourcing without revealing supplier details
              </p>
              {zkConfig.enableSupplyChainPrivacy && (
                <input
                  type="text"
                  value={zkConfig.supplyChainClaim}
                  onChange={(e) => updateConfig({ supplyChainClaim: e.target.value })}
                  placeholder="e.g., 'Ethical supply chain provenance verified'"
                  className="mt-2 w-full px-3 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-blue-100 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> ZK proofs are generated on-chain and stored via smart contracts. 
              This preserves the blockchain-first approach while adding privacy layers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
