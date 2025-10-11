'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdVerifiedUser, 
  MdSecurity, 
  MdCheckCircle, 
  MdError,
  MdWarning,
  MdRefresh,
  MdVisibility,
  MdCode,
  MdDownload,
  MdShare,
  MdInfo
} from 'react-icons/md';

interface ZKProofStatus {
  proofHash: string;
  proofType: string;
  circuitId: string;
  isValid: boolean;
  verificationTime: number;
  publicSignals: string[];
  verificationKey: string;
  generatedAt: number;
  batchId: string;
}

interface VerificationResult {
  success: boolean;
  proofHash: string;
  verificationTimestamp: number;
  circuitId: string;
  gasUsed?: number;
  blockNumber?: number;
  transactionHash?: string;
}

export default function ZKProofVerificationDashboard() {
  const [proofs, setProofs] = useState<ZKProofStatus[]>([]);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [selectedProof, setSelectedProof] = useState<ZKProofStatus | null>(null);
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMockProofs();
  }, []);

  const loadMockProofs = () => {
    // Mock ZK proofs data
    const mockProofs: ZKProofStatus[] = [
      {
        proofHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        proofType: 'Price Competitiveness',
        circuitId: 'PricePrivacyCircuit',
        isValid: true,
        verificationTime: 1250,
        publicSignals: ['1', '4500', '5500'],
        verificationKey: 'vk_price_privacy.json',
        generatedAt: Date.now() - 3600000,
        batchId: 'ETH-2024-001'
      },
      {
        proofHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        proofType: 'Quality Standards',
        circuitId: 'QualityTierCircuit',
        isValid: true,
        verificationTime: 980,
        publicSignals: ['1', '75', '5'],
        verificationKey: 'vk_quality_tier.json',
        generatedAt: Date.now() - 7200000,
        batchId: 'ETH-2024-001'
      },
      {
        proofHash: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
        proofType: 'Supply Chain Provenance',
        circuitId: 'SupplyChainPrivacyCircuit',
        isValid: true,
        verificationTime: 1550,
        publicSignals: ['1', '1', '1'],
        verificationKey: 'vk_supply_chain_privacy.json',
        generatedAt: Date.now() - 10800000,
        batchId: 'ETH-2024-002'
      },
      {
        proofHash: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        proofType: 'Ethiopian Compliance',
        circuitId: 'EthiopianComplianceCircuit',
        isValid: true,
        verificationTime: 2100,
        publicSignals: ['1', '1', '1', '1'],
        verificationKey: 'vk_ethiopian_compliance.json',
        generatedAt: Date.now() - 14400000,
        batchId: 'ETH-2024-002'
      },
      {
        proofHash: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        proofType: 'EUDR Compliance',
        circuitId: 'EUDRComplianceCircuit',
        isValid: false,
        verificationTime: 1850,
        publicSignals: ['0', '1', '1', '0'],
        verificationKey: 'vk_eudr_compliance.json',
        generatedAt: Date.now() - 18000000,
        batchId: 'ETH-2024-003'
      },
      {
        proofHash: '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        proofType: 'Banking Privacy',
        circuitId: 'BankingPrivacyCircuit',
        isValid: true,
        verificationTime: 1320,
        publicSignals: ['1', '1', '1'],
        verificationKey: 'vk_banking_privacy.json',
        generatedAt: Date.now() - 21600000,
        batchId: 'ETH-2024-003'
      }
    ];
    setProofs(mockProofs);
  };

  const verifyProofOnChain = async (proof: ZKProofStatus) => {
    setIsVerifying(prev => ({ ...prev, [proof.proofHash]: true }));
    
    try {
      // Simulate on-chain verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: VerificationResult = {
        success: proof.isValid,
        proofHash: proof.proofHash,
        verificationTimestamp: Date.now(),
        circuitId: proof.circuitId,
        gasUsed: Math.floor(Math.random() * 100000) + 50000,
        blockNumber: Math.floor(Math.random() * 1000000) + 19000000,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`
      };
      
      setVerificationResults(prev => ({
        ...prev,
        [proof.proofHash]: result
      }));
      
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(prev => ({ ...prev, [proof.proofHash]: false }));
    }
  };

  const toggleDetails = (proofHash: string) => {
    setShowDetails(prev => ({
      ...prev,
      [proofHash]: !prev[proofHash]
    }));
  };

  const getProofTypeColor = (proofType: string) => {
    const colors = {
      'Price Competitiveness': 'bg-blue-100 text-blue-800 border-blue-200',
      'Quality Standards': 'bg-green-100 text-green-800 border-green-200',
      'Supply Chain Provenance': 'bg-purple-100 text-purple-800 border-purple-200',
      'Ethiopian Compliance': 'bg-amber-100 text-amber-800 border-amber-200',
      'EUDR Compliance': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Banking Privacy': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[proofType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredProofs = proofs.filter(proof => {
    const matchesType = filterType === 'all' || proof.proofType.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      proof.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proof.proofType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proof.proofHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusStats = () => {
    const total = proofs.length;
    const valid = proofs.filter(p => p.isValid).length;
    const verified = Object.keys(verificationResults).length;
    return { total, valid, verified };
  };

  const stats = getStatusStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <MdVerifiedUser size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ZK Proof Verification Dashboard</h1>
              <p className="text-indigo-100">Monitor and verify zero-knowledge proofs across the WAGA system</p>
            </div>
          </div>
          <button
            onClick={loadMockProofs}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <MdRefresh size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdSecurity className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Proofs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.valid}</div>
              <div className="text-sm text-gray-600">Valid Proofs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdVerifiedUser className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.verified}</div>
              <div className="text-sm text-gray-600">On-Chain Verified</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <MdWarning className="text-amber-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total - stats.valid}</div>
              <div className="text-sm text-gray-600">Invalid Proofs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by batch ID, proof type, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Proof Types</option>
              <option value="price">Price Competitiveness</option>
              <option value="quality">Quality Standards</option>
              <option value="supply">Supply Chain</option>
              <option value="ethiopian">Ethiopian Compliance</option>
              <option value="eudr">EUDR Compliance</option>
              <option value="banking">Banking Privacy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proofs List */}
      <div className="space-y-4">
        {filteredProofs.map((proof) => (
          <div key={proof.proofHash} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getProofTypeColor(proof.proofType)}`}>
                    {proof.proofType}
                  </div>
                  <div className="flex items-center gap-2">
                    {proof.isValid ? (
                      <MdCheckCircle className="text-green-500" size={20} />
                    ) : (
                      <MdError className="text-red-500" size={20} />
                    )}
                    <span className={`text-sm font-medium ${proof.isValid ? 'text-green-700' : 'text-red-700'}`}>
                      {proof.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDetails(proof.proofHash)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MdVisibility size={18} />
                  </button>
                  <button
                    onClick={() => verifyProofOnChain(proof)}
                    disabled={isVerifying[proof.proofHash]}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isVerifying[proof.proofHash] ? 'Verifying...' : 'Verify On-Chain'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Batch ID:</span>
                  <div className="text-gray-900">{proof.batchId}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Circuit:</span>
                  <div className="text-gray-900 font-mono">{proof.circuitId}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Generation Time:</span>
                  <div className="text-gray-900">{proof.verificationTime}ms</div>
                </div>
              </div>

              {/* Verification Result */}
              {verificationResults[proof.proofHash] && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdCheckCircle className="text-green-600" size={20} />
                    <span className="font-medium text-green-900">On-Chain Verification Complete</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Gas Used:</span>
                      <div className="font-mono">{verificationResults[proof.proofHash].gasUsed?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Block:</span>
                      <div className="font-mono">{verificationResults[proof.proofHash].blockNumber?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Tx Hash:</span>
                      <div className="font-mono text-xs truncate">{verificationResults[proof.proofHash].transactionHash}</div>
                    </div>
                    <div>
                      <span className="text-green-700">Verified:</span>
                      <div>{new Date(verificationResults[proof.proofHash].verificationTimestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Information */}
              {showDetails[proof.proofHash] && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MdCode size={18} />
                        Proof Hash
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm font-mono break-all">{proof.proofHash}</code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Public Signals</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm font-mono">
                          [{proof.publicSignals.map(signal => `"${signal}"`).join(', ')}]
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Verification Key</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm font-mono">{proof.verificationKey}</code>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <MdDownload size={18} />
                        Download Proof
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <MdShare size={18} />
                        Share Verification
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProofs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MdInfo className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Proofs Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <MdInfo className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">ZK Proof Verification System</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All proofs are generated using Circom circuits and verified with snarkjs</li>
              <li>• On-chain verification ensures immutable proof validity</li>
              <li>• Public signals contain only non-sensitive verification data</li>
              <li>• Private inputs remain encrypted and never exposed</li>
              <li>• Verification keys are publicly auditable for transparency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}