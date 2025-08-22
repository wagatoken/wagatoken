'use client';

import { useState, useEffect } from 'react';
import { fetchPlatformStats, formatPlatformStats, PlatformStats } from '../../utils/platformStats';

export default function DynamicPlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const platformStats = await fetchPlatformStats();
        
        if (mounted) {
          setStats(platformStats);
        }
      } catch (err) {
        console.error('Failed to load platform stats:', err);
        if (mounted) {
          setError('Failed to load stats');
          // Set fallback stats
          setStats({
            totalBatches: 5,
            verificationRate: 80,
            ipfsStatus: 'Active',
            totalVerifiedBatches: 4,
            activeDistributors: 1,
            recentActivity: 1,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !stats) {
    return (
      <div className="web3-card animate-pulse">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <span>📊</span>
          <span>Platform Stats</span>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-28"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  const formattedStats = stats ? formatPlatformStats(stats) : null;

  return (
    <div className="web3-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <span>📊</span>
        <span>Platform Stats</span>
        {loading && (
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
          <span className="text-gray-800 font-medium">Total Batches:</span>
          <span className="text-emerald-600 font-bold">
            {formattedStats?.totalBatches || '0'}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
          <span className="text-gray-800 font-medium">Verification Rate:</span>
          <span className="text-emerald-600 font-bold">
            {formattedStats?.verificationRate || '0%'}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
          <span className="text-gray-800 font-medium">IPFS Status:</span>
          <span className={`font-bold ${
            stats?.ipfsStatus === 'Active' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {formattedStats?.ipfsStatus || 'Unknown'}
          </span>
        </div>
        {stats && stats.totalBatches > 0 && (
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
            <span className="text-gray-800 font-medium">Recent Activity:</span>
            <span className="text-blue-600 font-bold">
              {formattedStats?.recentActivity || 'None'}
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Using estimated data. {error}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Auto-refreshing every 30s</span>
        {stats && (
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
