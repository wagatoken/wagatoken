'use client';

import { useState, useEffect } from 'react';
import { 
  MdWarning, 
  MdError, 
  MdSchedule, 
  MdInventory,
  MdTrendingUp,
  MdRefresh,
  MdInfoOutline
} from 'react-icons/md';
import { 
  getInventoryStatistics,
  getCriticalBatches
} from '@/utils/inventoryManager';

interface InventoryStats {
  totalBatches: number;
  expiredBatches: number;
  lowInventoryBatches: number;
  batchesNeedingVerification: number;
  totalInventoryValue: number;
  averageBatchAge: number;
}

interface CriticalBatches {
  expiredBatches: string[];
  lowInventoryBatches: string[];
  verificationNeededBatches: string[];
  expiringBatches: string[];
}

export default function InventoryOverviewCard() {
  const [stats, setStats] = useState<InventoryStats>({
    totalBatches: 0,
    expiredBatches: 0,
    lowInventoryBatches: 0,
    batchesNeedingVerification: 0,
    totalInventoryValue: 0,
    averageBatchAge: 0
  });

  const [criticalBatches, setCriticalBatches] = useState<CriticalBatches>({
    expiredBatches: [],
    lowInventoryBatches: [],
    verificationNeededBatches: [],
    expiringBatches: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use empty array since we need to implement batch ID fetching
      // In a real implementation, this would fetch active batch IDs first
      const batchIds: string[] = []; // TODO: Implement getAllActiveBatchIds()
      
      // Load inventory statistics
      const inventoryStats = await getInventoryStatistics(batchIds);
      setStats(inventoryStats);

      // Load critical batches
      const critical = await getCriticalBatches(batchIds);
      setCriticalBatches(critical);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadInventoryData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertLevel = () => {
    const totalIssues = stats.expiredBatches + stats.lowInventoryBatches + stats.batchesNeedingVerification;
    if (totalIssues === 0) return 'success';
    if (totalIssues <= 2) return 'warning';
    return 'error';
  };

  const getAlertMessage = () => {
    const totalIssues = stats.expiredBatches + stats.lowInventoryBatches + stats.batchesNeedingVerification;
    if (totalIssues === 0) return 'All inventory healthy';
    if (totalIssues === 1) return '1 issue needs attention';
    return `${totalIssues} issues need attention`;
  };

  const alertLevel = getAlertLevel();
  const alertColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const alertIcons = {
    success: <MdInventory size={24} className="text-green-600" />,
    warning: <MdWarning size={24} className="text-yellow-600" />,
    error: <MdError size={24} className="text-red-600" />
  };

  return (
    <div className="web3-card animate-card-entrance">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MdInventory size={24} className="text-purple-600" />
          Inventory Overview
        </h3>
        <button
          onClick={loadInventoryData}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <MdRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Alert Summary */}
      <div className={`p-4 rounded-lg border-2 mb-6 transition-colors ${alertColors[alertLevel]}`}>
        <div className="flex items-center gap-3">
          {alertIcons[alertLevel]}
          <div>
            <div className="font-semibold">{getAlertMessage()}</div>
            {lastUpdated && (
              <div className="text-sm opacity-75">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Batches */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdInventory size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-800">Total Batches</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {isLoading ? '...' : stats.totalBatches}
          </div>
        </div>

        {/* Expired Batches */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdError size={20} className="text-red-600" />
            <span className="font-semibold text-red-800">Expired</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {isLoading ? '...' : stats.expiredBatches}
          </div>
        </div>

        {/* Low Inventory */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdWarning size={20} className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {isLoading ? '...' : stats.lowInventoryBatches}
          </div>
        </div>

        {/* Needs Verification */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdSchedule size={20} className="text-orange-600" />
            <span className="font-semibold text-orange-800">Needs Verify</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {isLoading ? '...' : stats.batchesNeedingVerification}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(stats.expiredBatches > 0 || stats.lowInventoryBatches > 0 || stats.batchesNeedingVerification > 0) && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <MdInfoOutline size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Quick Actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.expiredBatches > 0 && (
              <button
                onClick={() => window.location.href = '/admin?tab=inventory&view=expired'}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                View {stats.expiredBatches} expired batch{stats.expiredBatches !== 1 ? 'es' : ''}
              </button>
            )}
            {stats.lowInventoryBatches > 0 && (
              <button
                onClick={() => window.location.href = '/admin?tab=inventory&view=low'}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
              >
                View {stats.lowInventoryBatches} low stock
              </button>
            )}
            {stats.batchesNeedingVerification > 0 && (
              <button
                onClick={() => window.location.href = '/admin?tab=inventory&view=verification'}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Verify {stats.batchesNeedingVerification} batch{stats.batchesNeedingVerification !== 1 ? 'es' : ''}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}