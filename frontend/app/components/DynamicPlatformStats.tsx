'use client';

import { useState, useEffect } from 'react';
import { MdBarChart, MdCheckCircle, MdWarning, MdError, MdRefresh } from 'react-icons/md';
import { fetchPlatformStats, formatPlatformStats, PlatformStats } from '../../utils/platformStats';

export default function DynamicPlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading platform statistics...');
      
      const platformStats = await fetchPlatformStats();
      setStats(platformStats);
      setLastUpdated(new Date());
      console.log('✅ Platform statistics loaded successfully');
    } catch (err) {
      console.error('❌ Error loading platform stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getNetworkStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <MdCheckCircle className="text-green-600" />;
      case 'Warning':
        return <MdWarning className="text-amber-600" />;
      case 'Inactive':
        return <MdError className="text-red-600" />;
      default:
        return <MdCheckCircle className="text-green-600" />;
    }
  };

  const getNetworkStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Active';
      case 'Warning':
        return 'Limited';
      case 'Inactive':
        return 'Offline';
      default:
        return 'Active';
    }
  };

  if (loading && !stats) {
    return (
      <div className="web3-card animate-pulse">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MdBarChart className="text-purple-600" />
          <span>Platform Stats</span>
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <span className="text-gray-600">Loading statistics...</span>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <span className="text-gray-600">Fetching blockchain data...</span>
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <span className="text-gray-600">Checking IPFS status...</span>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="web3-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MdBarChart className="text-purple-600" />
          <span>Platform Stats</span>
          <button 
            onClick={loadStats}
            className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Retry"
          >
            <MdRefresh className="w-4 h-4 text-gray-600" />
          </button>
        </h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <MdError />
            <span className="text-sm">Unable to load real-time statistics</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button 
            onClick={loadStats}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const formattedStats = stats ? formatPlatformStats(stats) : null;

  return (
    <div className="web3-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <MdBarChart className="text-purple-600" />
        <span>Real-Time Platform Stats</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        )}
        <button 
          onClick={loadStats}
          className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh"
          disabled={loading}
        >
          <MdRefresh className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </h3>
      
      {formattedStats && (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Total Coffee Batches:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.totalBatches}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Active Batches:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.activeBatches}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Verification Rate:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.verificationRate}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">IPFS Files Stored:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.ipfsFilesStored}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">ZK Proofs Generated:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.zkProofsGenerated}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Total Volume:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.totalVolume}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Active Distributors:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.activeDistributors}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Recent Activity:</span>
            <span className="text-emerald-600 font-bold">{formattedStats.recentActivity}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">Network Status:</span>
            <span className="text-emerald-600 font-bold flex items-center space-x-1">
              {stats && getNetworkStatusIcon(stats.networkStatus)}
              <span>{stats ? getNetworkStatusText(stats.networkStatus) : 'Unknown'}</span>
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
            <span className="text-gray-800 font-medium">IPFS Status:</span>
            <span className="text-emerald-600 font-bold flex items-center space-x-1">
              {stats && stats.ipfsStatus === 'Active' ? (
                <MdCheckCircle className="text-green-600" />
              ) : (
                <MdError className="text-red-600" />
              )}
              <span>{stats?.ipfsStatus || 'Unknown'}</span>
            </span>
          </div>
        </div>
      )}
      
      {lastUpdated && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {error && stats && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          ⚠️ Some data may be cached due to connectivity issues
        </div>
      )}
    </div>
  );
}
