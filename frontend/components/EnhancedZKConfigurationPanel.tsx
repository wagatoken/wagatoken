'use client';

import React, { useState } from 'react';
import { 
  MdSecurity, 
  MdVerified, 
  MdShield, 
  MdVisibilityOff, 
  MdInfo,
  MdSettings,
  MdGppGood,
  MdAccountBalance,
  MdNature,
  MdWarning
} from 'react-icons/md';
import { EnhancedZKConfig, ComplianceProofData } from '../utils/enhancedZKProofs';

export interface EnhancedZKConfigurationPanelProps {
  zkConfig: EnhancedZKConfig;
  onConfigChange: (config: EnhancedZKConfig) => void;
  complianceData?: ComplianceProofData;
  onComplianceDataChange?: (data: ComplianceProofData) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  userRole?: 'ADMIN' | 'PROCESSOR' | 'COOPERATIVE' | 'ROASTER';
  className?: string;
}

export default function EnhancedZKConfigurationPanel({
  zkConfig,
  onConfigChange,
  complianceData,
  onComplianceDataChange,
  enabled,
  onEnabledChange,
  userRole = 'PROCESSOR',
  className = ''
}: EnhancedZKConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState<'core' | 'compliance' | 'banking' | 'advanced'>('core');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const updateConfig = (updates: Partial<EnhancedZKConfig>) => {
    onConfigChange({ ...zkConfig, ...updates });
  };

  const updateComplianceData = (updates: Partial<ComplianceProofData>) => {
    if (complianceData && onComplianceDataChange) {
      onComplianceDataChange({ ...complianceData, ...updates });
    }
  };

  const getProofComplexityDescription = (complexity: string) => {
    switch (complexity) {
      case 'standard':
        return 'Basic ZK proofs with essential privacy features';
      case 'enhanced':
        return 'Advanced proofs with compliance verification';
      case 'maximum':
        return 'Full-featured proofs with maximum privacy protection';
      default:
        return '';
    }
  };

  const canAccessComplianceFeatures = () => {
    return userRole === 'ADMIN' || userRole === 'PROCESSOR';
  };

  const canAccessBankingFeatures = () => {
    return userRole === 'ADMIN';
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-xl border-2 border-indigo-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MdSecurity size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-indigo-900">Enhanced ZK Privacy System</h3>
              <p className="text-sm text-indigo-700">Advanced zero-knowledge privacy with compliance integration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-indigo-700">Enable Privacy</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {enabled && (
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'core', label: 'Core Privacy', icon: <MdShield size={16} /> },
              { id: 'compliance', label: 'Compliance', icon: <MdVerified size={16} />, restricted: !canAccessComplianceFeatures() },
              { id: 'banking', label: 'Banking', icon: <MdAccountBalance size={16} />, restricted: !canAccessBankingFeatures() },
              { id: 'advanced', label: 'Advanced', icon: <MdSettings size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={tab.restricted}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : tab.restricted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.restricted && <MdWarning size={14} className="text-gray-400" />}
              </button>
            ))}
          </div>

          {/* Core Privacy Tab */}
          {activeTab === 'core' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Privacy */}
                <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg mt-1">
                      <MdAccountBalance size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Price Privacy</h4>
                        <input
                          type="checkbox"
                          checked={zkConfig.enablePricePrivacy}
                          onChange={(e) => updateConfig({ enablePricePrivacy: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Hide actual costs and profit margins while proving competitiveness
                      </p>
                      {zkConfig.enablePricePrivacy && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Pricing Claim
                          </label>
                          <input
                            type="text"
                            value={zkConfig.pricingClaim}
                            onChange={(e) => updateConfig({ pricingClaim: e.target.value })}
                            placeholder="e.g., 'Competitive market pricing verified'"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          PricePrivacyCircuit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quality Privacy */}
                <div className="bg-white rounded-lg p-5 border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg mt-1">
                      <MdVerified size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Quality Privacy</h4>
                        <input
                          type="checkbox"
                          checked={zkConfig.enableQualityPrivacy}
                          onChange={(e) => updateConfig({ enableQualityPrivacy: e.target.checked })}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Verify quality standards without exposing detailed scores
                      </p>
                      {zkConfig.enableQualityPrivacy && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quality Claim
                          </label>
                          <input
                            type="text"
                            value={zkConfig.qualityClaim}
                            onChange={(e) => updateConfig({ qualityClaim: e.target.value })}
                            placeholder="e.g., 'Premium quality standards verified'"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          QualityTierCircuit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supply Chain Privacy */}
                <div className="bg-white rounded-lg p-5 border border-purple-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg mt-1">
                      <MdVisibilityOff size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Supply Chain Privacy</h4>
                        <input
                          type="checkbox"
                          checked={zkConfig.enableSupplyChainPrivacy}
                          onChange={(e) => updateConfig({ enableSupplyChainPrivacy: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Prove ethical sourcing without revealing supplier details
                      </p>
                      {zkConfig.enableSupplyChainPrivacy && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Supply Chain Claim
                          </label>
                          <input
                            type="text"
                            value={zkConfig.supplyChainClaim}
                            onChange={(e) => updateConfig({ supplyChainClaim: e.target.value })}
                            placeholder="e.g., 'Ethical sourcing verified'"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          SupplyChainPrivacyCircuit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Privacy Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdInfo className="text-blue-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Core Privacy Features</h4>
                    <p className="text-sm text-blue-800">
                      These privacy features use zero-knowledge proofs to verify claims without revealing sensitive data. 
                      Proofs are generated using Circom circuits and verified on-chain through smart contracts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && canAccessComplianceFeatures() && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ethiopian Export Compliance */}
                <div className="bg-white rounded-lg p-5 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg mt-1">
                      <MdGppGood size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Ethiopian Export Compliance</h4>
                        <input
                          type="checkbox"
                          checked={zkConfig.enableEthiopianCompliance}
                          onChange={(e) => updateConfig({ enableEthiopianCompliance: e.target.checked })}
                          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Verify ECTA permit and export compliance without revealing sensitive regulatory data
                      </p>
                      {zkConfig.enableEthiopianCompliance && complianceData && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              ECTA Permit Number
                            </label>
                            <input
                              type="text"
                              value={complianceData.ectaPermitNumber || ''}
                              onChange={(e) => updateComplianceData({ ectaPermitNumber: e.target.value })}
                              placeholder="ECTA-2024-001"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Export License Hash
                            </label>
                            <input
                              type="text"
                              value={complianceData.exportLicenseHash || ''}
                              onChange={(e) => updateComplianceData({ exportLicenseHash: e.target.value })}
                              placeholder="0x..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-3">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          EthiopianComplianceCircuit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EUDR Compliance */}
                <div className="bg-white rounded-lg p-5 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg mt-1">
                      <MdNature size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">EUDR Deforestation Compliance</h4>
                        <input
                          type="checkbox"
                          checked={zkConfig.enableEUDRCompliance}
                          onChange={(e) => updateConfig({ enableEUDRCompliance: e.target.checked })}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Prove EUDR compliance without exposing forest monitoring data
                      </p>
                      {zkConfig.enableEUDRCompliance && complianceData && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Deforestation Risk Score (0-1)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={complianceData.deforestationRiskScore || 0}
                              onChange={(e) => updateComplianceData({ deforestationRiskScore: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Forest Monitoring Data Hash
                            </label>
                            <input
                              type="text"
                              value={complianceData.forestMonitoringData || ''}
                              onChange={(e) => updateComplianceData({ forestMonitoringData: e.target.value })}
                              placeholder="0x..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-3">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          EUDRComplianceCircuit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdGppGood className="text-amber-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">Compliance Privacy Benefits</h4>
                    <p className="text-sm text-amber-800">
                      Compliance proofs allow verification of regulatory adherence without exposing sensitive 
                      regulatory documents or internal compliance processes to competitors or unauthorized parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === 'banking' && canAccessBankingFeatures() && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-5 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg mt-1">
                    <MdAccountBalance size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Banking & Financial Privacy</h4>
                      <input
                        type="checkbox"
                        checked={zkConfig.enableBankingPrivacy}
                        onChange={(e) => updateConfig({ enableBankingPrivacy: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Verify financial compliance and USDC transfers without revealing transaction details
                    </p>
                    
                    {zkConfig.enableBankingPrivacy && complianceData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            USDC Transfer Hash
                          </label>
                          <input
                            type="text"
                            value={complianceData.usdcTransferHash || ''}
                            onChange={(e) => updateComplianceData({ usdcTransferHash: e.target.value })}
                            placeholder="0x..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Exchange Rate Proof
                          </label>
                          <input
                            type="text"
                            value={complianceData.exchangeRateProof || ''}
                            onChange={(e) => updateComplianceData({ exchangeRateProof: e.target.value })}
                            placeholder="Rate verification hash"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        BankingPrivacyCircuit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdAccountBalance className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-indigo-900 mb-1">Banking Privacy Protection</h4>
                    <p className="text-sm text-indigo-800">
                      Financial privacy proofs protect sensitive banking information while ensuring compliance 
                      with anti-money laundering (AML) and know your customer (KYC) requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Proof Complexity */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Proof Complexity</h4>
                  <div className="space-y-3">
                    {['standard', 'enhanced', 'maximum'].map((complexity) => (
                      <label key={complexity} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="proofComplexity"
                          value={complexity}
                          checked={zkConfig.proofComplexity === complexity}
                          onChange={(e) => updateConfig({ proofComplexity: e.target.value as any })}
                          className="mt-1 w-4 h-4 text-indigo-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{complexity}</div>
                          <div className="text-sm text-gray-600">{getProofComplexityDescription(complexity)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Privacy Options */}
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Additional Privacy Options</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Batch Encryption</div>
                        <div className="text-sm text-gray-600">Encrypt batch metadata on IPFS</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={zkConfig.batchEncryption}
                        onChange={(e) => updateConfig({ batchEncryption: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Metadata Hiding</div>
                        <div className="text-sm text-gray-600">Hide non-essential metadata fields</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={zkConfig.metadataHiding}
                        onChange={(e) => updateConfig({ metadataHiding: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Compliance Claim */}
              {(zkConfig.enableEthiopianCompliance || zkConfig.enableEUDRCompliance || zkConfig.enableBankingPrivacy) && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Compliance Claim</h4>
                  <input
                    type="text"
                    value={zkConfig.complianceClaim}
                    onChange={(e) => updateConfig({ complianceClaim: e.target.value })}
                    placeholder="e.g., 'Full regulatory compliance verified through ZK proofs'"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    This claim will be associated with your comprehensive compliance proof
                  </p>
                </div>
              )}

              {/* Advanced Settings Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium text-gray-900">Circuit-Specific Settings</span>
                  <MdSettings className={`transform transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                </button>
                
                {showAdvancedSettings && (
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <p>• Custom circuit parameters can be configured here</p>
                    <p>• Proof verification thresholds and constraints</p>
                    <p>• Advanced cryptographic settings</p>
                    <p className="text-indigo-600 font-medium">Contact admin for circuit customization</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <MdShield size={20} />
              Privacy Configuration Summary
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${zkConfig.enablePricePrivacy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Price Privacy: {zkConfig.enablePricePrivacy ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${zkConfig.enableQualityPrivacy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Quality Privacy: {zkConfig.enableQualityPrivacy ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${zkConfig.enableSupplyChainPrivacy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Supply Chain Privacy: {zkConfig.enableSupplyChainPrivacy ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${zkConfig.enableEthiopianCompliance || zkConfig.enableEUDRCompliance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Compliance: {zkConfig.enableEthiopianCompliance || zkConfig.enableEUDRCompliance ? 'Enhanced' : 'Standard'}</span>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-indigo-700">
              <strong>Estimated proof generation time:</strong> {zkConfig.proofComplexity === 'maximum' ? '15-30' : zkConfig.proofComplexity === 'enhanced' ? '8-15' : '3-8'} seconds per proof
            </div>
          </div>
        </div>
      )}
    </div>
  );
}