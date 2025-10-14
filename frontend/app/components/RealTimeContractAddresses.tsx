'use client';

import { useState, useEffect } from 'react';
import { MdLink, MdVerified, MdOpenInNew, MdRefresh, MdContentCopy, MdCheck } from 'react-icons/md';
import { DEPLOYED_CONTRACTS, getContractsByCategory, getContractStats, formatAddress, ContractInfo } from '../../utils/contractAddresses';

export default function RealTimeContractAddresses() {
  const [contracts, setContracts] = useState(DEPLOYED_CONTRACTS);
  const [contractStats, setContractStats] = useState(getContractStats());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contractsByCategory = getContractsByCategory();

  const refreshContracts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Refreshing contract information...');
      
      // In a real implementation, this would fetch latest contract data
      // For now, we'll just update the timestamp and stats
      setContracts(DEPLOYED_CONTRACTS);
      setContractStats(getContractStats());
      setLastUpdated(new Date());
      
      console.log('✅ Contract information refreshed');
    } catch (error) {
      console.error('❌ Error refreshing contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshContracts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Core': 
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700',
          hover: 'hover:bg-emerald-200',
          code: 'bg-emerald-100 text-emerald-800'
        };
      case 'Operations': 
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700',
          hover: 'hover:bg-blue-200',
          code: 'bg-blue-100 text-blue-800'
        };
      case 'Compliance': 
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700',
          hover: 'hover:bg-amber-200',
          code: 'bg-amber-100 text-amber-800'
        };
      case 'Privacy': 
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700',
          hover: 'hover:bg-purple-200',
          code: 'bg-purple-100 text-purple-800'
        };
      case 'ZK-Verifiers': 
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-600',
          badge: 'bg-indigo-100 text-indigo-700',
          hover: 'hover:bg-indigo-200',
          code: 'bg-indigo-100 text-indigo-800'
        };
      case 'Integration': 
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-600',
          badge: 'bg-pink-100 text-pink-700',
          hover: 'hover:bg-pink-200',
          code: 'bg-pink-100 text-pink-800'
        };
      default: 
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
          hover: 'hover:bg-gray-200',
          code: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core': return '🏗️';
      case 'Operations': return '⚙️';
      case 'Compliance': return '📋';
      case 'Privacy': return '🔒';
      case 'ZK-Verifiers': return '🛡️';
      case 'Integration': return '🔗';
      default: return '📄';
    }
  };

  return (
    <div className="web3-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MdLink className="text-xl text-emerald-600" />
          <span>Live Smart Contract Addresses</span>
        </h3>
        <button 
          onClick={refreshContracts}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh contract data"
        >
          <MdRefresh className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm text-emerald-600">Refresh</span>
        </button>
      </div>

      {/* Contract Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-emerald-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-emerald-600">{contractStats.totalContracts}</div>
          <div className="text-xs text-emerald-700">Total Contracts</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">{contractStats.verifiedContracts}</div>
          <div className="text-xs text-green-700">Verified</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{Object.keys(contractsByCategory).length}</div>
          <div className="text-xs text-blue-700">Categories</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">Base Sepolia</div>
          <div className="text-xs text-purple-700">Network</div>
        </div>
      </div>

      {/* Contract Categories */}
      <div className="space-y-6">
        {Object.entries(contractsByCategory).map(([category, categoryContracts]) => {
          const styles = getCategoryStyles(category);
          const icon = getCategoryIcon(category);
          
          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <span className="text-lg">{icon}</span>
                <span>{category} Contracts</span>
                <span className={`px-2 py-1 text-xs ${styles.badge} rounded-full`}>
                  {categoryContracts.length}
                </span>
              </h4>
              
              <div className="space-y-2">
                {categoryContracts.map((contract) => (
                  <div key={contract.address} className={`p-3 ${styles.bg} rounded-lg`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {contract.name}
                          </h5>
                          {contract.verified && (
                            <MdVerified className={`w-4 h-4 ${styles.text}`} title="Verified on BaseScan" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                          {contract.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className={`text-xs ${styles.code} px-2 py-1 rounded font-mono`}>
                            {formatAddress(contract.address, 8, 6)}
                          </code>
                          <button
                            onClick={() => copyToClipboard(contract.address)}
                            className={`p-1 ${styles.hover} rounded transition-colors`}
                            title="Copy full address"
                          >
                            {copiedAddress === contract.address ? (
                              <MdCheck className="w-3 h-3 text-green-600" />
                            ) : (
                              <MdContentCopy className={`w-3 h-3 ${styles.text}`} />
                            )}
                          </button>
                          <a
                            href={contract.baseScanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1 ${styles.hover} rounded transition-colors`}
                            title="View on BaseScan"
                          >
                            <MdOpenInNew className={`w-3 h-3 ${styles.text}`} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Network Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium text-gray-900">Base Sepolia Testnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chain ID:</span>
            <span className="font-medium text-gray-900">84532</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Block Explorer:</span>
            <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              BaseScan
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">RPC URL:</span>
            <span className="font-medium text-gray-900 font-mono text-xs">sepolia.base.org</span>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Contract data last updated: {lastUpdated.toLocaleString()}
        </p>
      </div>
    </div>
  );
}