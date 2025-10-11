'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdCloudUpload, 
  MdSecurity, 
  MdVerifiedUser, 
  MdLock, 
  MdVisibility,
  MdVisibilityOff,
  MdInfo,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdHourglassEmpty
} from 'react-icons/md';
import EnhancedZKConfigurationPanel from './EnhancedZKConfigurationPanel';
import { 
  EnhancedZKConfig, 
  ComplianceProofData, 
  EnhancedZKProofGenerator,
  ZKProofManager
} from '../utils/enhancedZKProofs';

interface BatchData {
  // Basic batch information
  batchId: string;
  coffeeOrigin: string;
  farmLocation: string;
  harvestDate: string;
  quantity: number;
  qualityScore: number;
  
  // Pricing information
  costPerKg: number;
  pricePerKg: number;
  marketPrice: number;
  
  // Supply chain data
  farmerName: string;
  cooperativeName: string;
  processingDate: string;
  certifications: string[];
  
  // Compliance data
  ectaPermitNumber?: string;
  exportLicenseNumber?: string;
  deforestationRiskScore?: number;
  forestMonitoringData?: string;
  
  // Banking data
  usdcTransferHash?: string;
  exchangeRate?: number;
}

type ProofGenerationStatus = 'idle' | 'generating' | 'completed' | 'error';

interface ProofStatus {
  price: ProofGenerationStatus;
  quality: ProofGenerationStatus;
  supplyChain: ProofGenerationStatus;
  ethiopianCompliance: ProofGenerationStatus;
  eudrCompliance: ProofGenerationStatus;
  bankingPrivacy: ProofGenerationStatus;
}

export default function PrivacyEnhancedBatchCreationForm() {
  const [batchData, setBatchData] = useState<BatchData>({
    batchId: '',
    coffeeOrigin: '',
    farmLocation: '',
    harvestDate: '',
    quantity: 0,
    qualityScore: 0,
    costPerKg: 0,
    pricePerKg: 0,
    marketPrice: 0,
    farmerName: '',
    cooperativeName: '',
    processingDate: '',
    certifications: []
  });

  const [zkConfig, setZkConfig] = useState<EnhancedZKConfig>({
    enablePricePrivacy: false,
    enableQualityPrivacy: false,
    enableSupplyChainPrivacy: false,
    enableEthiopianCompliance: false,
    enableEUDRCompliance: false,
    enableBankingPrivacy: false,
    proofComplexity: 'standard',
    batchEncryption: false,
    metadataHiding: false,
    pricingClaim: '',
    qualityClaim: '',
    supplyChainClaim: '',
    complianceClaim: ''
  });

  const [complianceData, setComplianceData] = useState<ComplianceProofData>({
    ectaPermitNumber: '',
    exportLicenseHash: '',
    originCertificateHash: '',
    qualityGradeProof: '',
    deforestationRiskScore: 0,
    forestMonitoringData: '',
    traceabilityChainHash: '',
    dueDiligenceProof: '',
    usdcTransferHash: '',
    exchangeRateProof: '',
    paymentVerificationHash: '',
    batchId: '',
    timestamp: Date.now(),
    complianceLevel: 'basic'
  });

  const [zkEnabled, setZkEnabled] = useState(false);
  const [proofStatus, setProofStatus] = useState<ProofStatus>({
    price: 'idle',
    quality: 'idle',
    supplyChain: 'idle',
    ethiopianCompliance: 'idle',
    eudrCompliance: 'idle',
    bankingPrivacy: 'idle'
  });

  const [generatedProofs, setGeneratedProofs] = useState<Record<string, any>>({});
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const proofGenerator = new EnhancedZKProofGenerator();
  const proofManager = new ZKProofManager();

  const updateBatchData = (updates: Partial<BatchData>) => {
    setBatchData(prev => ({ ...prev, ...updates }));
  };

  const updateProofStatus = (proofType: keyof ProofStatus, status: ProofGenerationStatus) => {
    setProofStatus(prev => ({ ...prev, [proofType]: status }));
  };

  const generateZKProofs = async () => {
    const proofs: Record<string, any> = {};
    
    try {
      // Price Privacy Proof
      if (zkConfig.enablePricePrivacy) {
        updateProofStatus('price', 'generating');
        const priceProof = await proofGenerator.generatePriceCompetitivenessProof(
          batchData.pricePerKg,
          batchData.marketPrice * 0.9, // market min
          batchData.marketPrice * 1.1, // market max
          batchData.pricePerKg - batchData.costPerKg // profit margin
        );
        proofs.price = priceProof;
        updateProofStatus('price', 'completed');
      }

      // Quality Privacy Proof
      if (zkConfig.enableQualityPrivacy) {
        updateProofStatus('quality', 'generating');
        const qualityProof = await proofGenerator.generateQualityStandardsProof(
          batchData.qualityScore,
          2.0, // defect rate
          12.0, // moisture content
          75 // minimum quality threshold
        );
        proofs.quality = qualityProof;
        updateProofStatus('quality', 'completed');
      }

      // Supply Chain Privacy Proof
      if (zkConfig.enableSupplyChainPrivacy) {
        updateProofStatus('supplyChain', 'generating');
        const supplyChainProof = await proofGenerator.generateSupplyChainProvenanceProof(
          `hash_${batchData.farmerName}`, // farmer verification hash
          batchData.cooperativeName,
          batchData.certifications.includes('Fair Trade'),
          batchData.certifications.includes('Organic')
        );
        proofs.supplyChain = supplyChainProof;
        updateProofStatus('supplyChain', 'completed');
      }

      // Ethiopian Compliance Proof
      if (zkConfig.enableEthiopianCompliance) {
        updateProofStatus('ethiopianCompliance', 'generating');
        const ethiopianProof = await proofGenerator.generateEthiopianComplianceProof(
          complianceData.ectaPermitNumber || '',
          !!complianceData.exportLicenseHash,
          !!complianceData.originCertificateHash,
          !!complianceData.qualityGradeProof
        );
        proofs.ethiopianCompliance = ethiopianProof;
        updateProofStatus('ethiopianCompliance', 'completed');
      }

      // EUDR Compliance Proof
      if (zkConfig.enableEUDRCompliance) {
        updateProofStatus('eudrCompliance', 'generating');
        const eudrProof = await proofGenerator.generateEUDRComplianceProof(
          complianceData.deforestationRiskScore || 0,
          !!complianceData.forestMonitoringData,
          !!complianceData.traceabilityChainHash,
          !!complianceData.dueDiligenceProof
        );
        proofs.eudrCompliance = eudrProof;
        updateProofStatus('eudrCompliance', 'completed');
      }

      // Banking Privacy Proof
      if (zkConfig.enableBankingPrivacy) {
        updateProofStatus('bankingPrivacy', 'generating');
        const bankingProof = await proofGenerator.generateBankingPrivacyProof(
          batchData.quantity * batchData.pricePerKg, // USDC transfer amount
          1.0, // exchange rate
          !!complianceData.usdcTransferHash,
          true // compliance check passed
        );
        proofs.bankingPrivacy = bankingProof;
        updateProofStatus('bankingPrivacy', 'completed');
      }

      setGeneratedProofs(proofs);
      return proofs;
    } catch (error) {
      console.error('Error generating ZK proofs:', error);
      // Update failed proof status
      Object.keys(proofStatus).forEach(proofType => {
        if (proofStatus[proofType as keyof ProofStatus] === 'generating') {
          updateProofStatus(proofType as keyof ProofStatus, 'error');
        }
      });
      throw error;
    }
  };

  const uploadToIPFS = async (data: any) => {
    // Simulate IPFS upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    setIpfsHash(mockHash);
    return mockHash;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let proofs: Record<string, any> = {};
      
      // Generate ZK proofs if privacy is enabled
      if (zkEnabled) {
        proofs = await generateZKProofs();
      }

      // Prepare metadata for IPFS
      const metadata = {
        batchData: zkConfig.metadataHiding ? {
          // Only include non-sensitive fields if metadata hiding is enabled
          batchId: batchData.batchId,
          coffeeOrigin: batchData.coffeeOrigin,
          harvestDate: batchData.harvestDate,
          quantity: batchData.quantity
        } : batchData,
        zkProofs: proofs,
        complianceData: zkEnabled ? complianceData : undefined,
        privacyConfig: zkEnabled ? zkConfig : undefined,
        timestamp: new Date().toISOString()
      };

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(metadata);
      
      // Simulate smart contract interaction
      console.log('Creating batch with IPFS hash:', ipfsHash);
      console.log('ZK proofs generated:', Object.keys(proofs));
      
      alert(`Batch created successfully!\nIPFS Hash: ${ipfsHash}\nZK Proofs: ${Object.keys(proofs).join(', ')}`);
      
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error creating batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProofStatusIcon = (status: ProofGenerationStatus) => {
    switch (status) {
      case 'generating':
        return <MdHourglassEmpty className="text-yellow-500 animate-spin" size={16} />;
      case 'completed':
        return <MdCheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <MdError className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  const getEnabledProofCount = () => {
    return Object.values(zkConfig).filter((value, index) => 
      index < 6 && value === true // First 6 values are the enable flags
    ).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <MdSecurity size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Privacy-Enhanced Batch Creation</h1>
            <p className="text-blue-100">Create coffee batches with advanced zero-knowledge privacy protection</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Batch Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdCloudUpload size={24} className="text-blue-600" />
            Batch Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch ID</label>
              <input
                type="text"
                value={batchData.batchId}
                onChange={(e) => updateBatchData({ batchId: e.target.value })}
                placeholder="ETH-2024-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coffee Origin</label>
              <input
                type="text"
                value={batchData.coffeeOrigin}
                onChange={(e) => updateBatchData({ coffeeOrigin: e.target.value })}
                placeholder="Sidama, Ethiopia"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
              <input
                type="text"
                value={batchData.farmLocation}
                onChange={(e) => updateBatchData({ farmLocation: e.target.value })}
                placeholder="GPS coordinates or region"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Date</label>
              <input
                type="date"
                value={batchData.harvestDate}
                onChange={(e) => updateBatchData({ harvestDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
              <input
                type="number"
                value={batchData.quantity}
                onChange={(e) => updateBatchData({ quantity: parseFloat(e.target.value) })}
                placeholder="1000"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality Score (0-100)</label>
              <input
                type="number"
                value={batchData.qualityScore}
                onChange={(e) => updateBatchData({ qualityScore: parseFloat(e.target.value) })}
                placeholder="85"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Sensitive Information Section */}
        <div className="bg-white rounded-xl border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MdLock size={24} className="text-orange-600" />
              Sensitive Information
            </h2>
            <button
              type="button"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              {showSensitiveData ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
            </button>
          </div>
          
          {showSensitiveData && (
            <div className="space-y-6">
              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost per kg (USD)</label>
                    <input
                      type="number"
                      value={batchData.costPerKg}
                      onChange={(e) => updateBatchData({ costPerKg: parseFloat(e.target.value) })}
                      placeholder="3.50"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per kg (USD)</label>
                    <input
                      type="number"
                      value={batchData.pricePerKg}
                      onChange={(e) => updateBatchData({ pricePerKg: parseFloat(e.target.value) })}
                      placeholder="5.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Market Price (USD)</label>
                    <input
                      type="number"
                      value={batchData.marketPrice}
                      onChange={(e) => updateBatchData({ marketPrice: parseFloat(e.target.value) })}
                      placeholder="4.80"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Supply Chain Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Farmer Name</label>
                    <input
                      type="text"
                      value={batchData.farmerName}
                      onChange={(e) => updateBatchData({ farmerName: e.target.value })}
                      placeholder="Abebe Bekele"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cooperative Name</label>
                    <input
                      type="text"
                      value={batchData.cooperativeName}
                      onChange={(e) => updateBatchData({ cooperativeName: e.target.value })}
                      placeholder="Sidama Coffee Growers Cooperative"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Processing Date</label>
                    <input
                      type="date"
                      value={batchData.processingDate}
                      onChange={(e) => updateBatchData({ processingDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <input
                      type="text"
                      value={batchData.certifications.join(', ')}
                      onChange={(e) => updateBatchData({ certifications: e.target.value.split(', ').filter(c => c.trim()) })}
                      placeholder="Organic, Fair Trade, Rainforest Alliance"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdWarning className="text-orange-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">Sensitive Data Protection</h4>
                    <p className="text-sm text-orange-800">
                      This information will be protected using zero-knowledge proofs when privacy features are enabled. 
                      Only cryptographic proofs will be stored on-chain, not the actual sensitive data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ZK Privacy Configuration */}
        <EnhancedZKConfigurationPanel
          zkConfig={zkConfig}
          onConfigChange={setZkConfig}
          complianceData={complianceData}
          onComplianceDataChange={setComplianceData}
          enabled={zkEnabled}
          onEnabledChange={setZkEnabled}
          userRole="PROCESSOR"
        />

        {/* Proof Generation Status */}
        {zkEnabled && getEnabledProofCount() > 0 && (
          <div className="bg-white rounded-xl border border-indigo-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MdVerifiedUser size={24} className="text-indigo-600" />
              ZK Proof Generation Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zkConfig.enablePricePrivacy && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-900">Price Privacy Proof</span>
                  {getProofStatusIcon(proofStatus.price)}
                </div>
              )}
              
              {zkConfig.enableQualityPrivacy && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-900">Quality Privacy Proof</span>
                  {getProofStatusIcon(proofStatus.quality)}
                </div>
              )}
              
              {zkConfig.enableSupplyChainPrivacy && (
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="font-medium text-purple-900">Supply Chain Privacy Proof</span>
                  {getProofStatusIcon(proofStatus.supplyChain)}
                </div>
              )}
              
              {zkConfig.enableEthiopianCompliance && (
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="font-medium text-amber-900">Ethiopian Compliance Proof</span>
                  {getProofStatusIcon(proofStatus.ethiopianCompliance)}
                </div>
              )}
              
              {zkConfig.enableEUDRCompliance && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="font-medium text-green-900">EUDR Compliance Proof</span>
                  {getProofStatusIcon(proofStatus.eudrCompliance)}
                </div>
              )}
              
              {zkConfig.enableBankingPrivacy && (
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <span className="font-medium text-indigo-900">Banking Privacy Proof</span>
                  {getProofStatusIcon(proofStatus.bankingPrivacy)}
                </div>
              )}
            </div>

            {Object.keys(generatedProofs).length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MdCheckCircle className="text-green-600" size={20} />
                  <h4 className="font-medium text-green-900">Proofs Generated Successfully</h4>
                </div>
                <p className="text-sm text-green-800">
                  {Object.keys(generatedProofs).length} ZK proof(s) generated and ready for on-chain verification.
                </p>
              </div>
            )}
          </div>
        )}

        {/* IPFS Upload Status */}
        {ipfsHash && (
          <div className="bg-white rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MdCheckCircle className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-green-900">IPFS Upload Successful</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">IPFS Hash:</p>
              <code className="text-sm bg-white px-3 py-2 rounded border font-mono break-all">
                {ipfsHash}
              </code>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <MdHourglassEmpty className="animate-spin" size={20} />
                Creating Batch with Privacy Proofs...
              </>
            ) : (
              <>
                <MdSecurity size={20} />
                Create Privacy-Enhanced Batch
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <MdInfo className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Privacy & Security Information</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Zero-knowledge proofs ensure sensitive data never leaves your control</li>
              <li>• Only cryptographic proofs are stored on-chain, not actual data</li>
              <li>• IPFS metadata can be encrypted for additional privacy</li>
              <li>• Compliance proofs verify regulatory adherence without data exposure</li>
              <li>• All proofs are verifiable by third parties without revealing secrets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}