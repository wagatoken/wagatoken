'use client';

import { useState, useEffect } from 'react';
import { 
  MdWarning, 
  MdError, 
  MdSchedule, 
  MdInventory,
  MdRefresh,
  MdSettings,
  MdCheck,
  MdInfo,
  MdTimer,
  MdStorage,
  MdNotifications
} from 'react-icons/md';
import { 
  getInventoryStatistics,
  getCriticalBatches,
  getInventoryThresholds,
  setLowInventoryThreshold,
  setVerificationInterval,
  checkBatchExpiry,
  checkLowInventory,
  performPeriodicChecks
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

interface InventoryThresholds {
  lowInventoryThreshold: number;
  verificationInterval: number;
  maxBatchesPerCheck: number;
}

export default function InventoryManagementTab() {
  const [activeView, setActiveView] = useState<'overview' | 'expired' | 'low' | 'verification' | 'settings'>('overview');
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

  const [thresholds, setThresholds] = useState<InventoryThresholds>({
    lowInventoryThreshold: 10,
    verificationInterval: 7 * 24 * 60 * 60, // 7 days
    maxBatchesPerCheck: 50
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, using empty array - in production would fetch active batch IDs
      const batchIds: string[] = [];
      
      const [inventoryStats, critical, inventoryThresholds] = await Promise.all([
        getInventoryStatistics(batchIds),
        getCriticalBatches(batchIds),
        getInventoryThresholds()
      ]);

      setStats(inventoryStats);
      setCriticalBatches(critical);
      setThresholds(inventoryThresholds);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setMessage({ type: 'error', text: 'Failed to load inventory data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPeriodicCheck = async () => {
    try {
      setIsUpdating(true);
      setMessage({ type: 'info', text: 'Running periodic inventory checks...' });
      
      // In production, this would get actual batch IDs
      const batchIds = criticalBatches.verificationNeededBatches;
      
      if (batchIds.length === 0) {
        setMessage({ type: 'info', text: 'No batches require verification at this time' });
        return;
      }

      await performPeriodicChecks(batchIds);
      await loadInventoryData(); // Refresh data
      
      setMessage({ type: 'success', text: `Completed verification checks for ${batchIds.length} batch(es)` });
    } catch (error) {
      console.error('Error running periodic checks:', error);
      setMessage({ type: 'error', text: 'Failed to run periodic checks' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateThreshold = async (type: 'inventory' | 'verification', value: number) => {
    try {
      setIsUpdating(true);
      
      if (type === 'inventory') {
        await setLowInventoryThreshold(value);
        setThresholds(prev => ({ ...prev, lowInventoryThreshold: value }));
        setMessage({ type: 'success', text: 'Low inventory threshold updated' });
      } else {
        await setVerificationInterval(value);
        setThresholds(prev => ({ ...prev, verificationInterval: value }));
        setMessage({ type: 'success', text: 'Verification interval updated' });
      }
    } catch (error) {
      console.error('Error updating threshold:', error);
      setMessage({ type: 'error', text: 'Failed to update threshold' });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadInventoryData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdInventory size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-800">Total Batches</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalBatches}</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdError size={20} className="text-red-600" />
            <span className="font-semibold text-red-800">Expired</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.expiredBatches}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdWarning size={20} className="text-yellow-600" />
            <span className="font-semibold text-yellow-800">Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{stats.lowInventoryBatches}</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdSchedule size={20} className="text-orange-600" />
            <span className="font-semibold text-orange-800">Needs Verify</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.batchesNeedingVerification}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="web3-card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleRunPeriodicCheck}
            disabled={isUpdating}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdRefresh size={20} className={`text-blue-600 ${isUpdating ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium text-blue-900">Run Verification Check</div>
              <div className="text-sm text-blue-600">Check all batches needing verification</div>
            </div>
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
          >
            <MdSettings size={20} className="text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Configure Thresholds</div>
              <div className="text-sm text-gray-600">Set inventory and verification limits</div>
            </div>
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="web3-card">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MdTimer size={20} className="text-gray-600" />
              <span>Verification Interval</span>
            </div>
            <span className="font-medium">{Math.floor(thresholds.verificationInterval / (24 * 60 * 60))} days</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MdStorage size={20} className="text-gray-600" />
              <span>Low Inventory Threshold</span>
            </div>
            <span className="font-medium">{thresholds.lowInventoryThreshold} units</span>
          </div>

          {lastUpdated && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MdInfo size={20} className="text-gray-600" />
                <span>Last Updated</span>
              </div>
              <span className="font-medium">{lastUpdated.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    const [newInventoryThreshold, setNewInventoryThreshold] = useState(thresholds.lowInventoryThreshold);
    const [newVerificationInterval, setNewVerificationInterval] = useState(Math.floor(thresholds.verificationInterval / (24 * 60 * 60)));

    return (
      <div className="space-y-6">
        <div className="web3-card">
          <h3 className="text-lg font-semibold mb-4">Inventory Thresholds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Inventory Threshold (units)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={newInventoryThreshold}
                  onChange={(e) => setNewInventoryThreshold(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
                <button
                  onClick={() => handleUpdateThreshold('inventory', newInventoryThreshold)}
                  disabled={isUpdating || newInventoryThreshold === thresholds.lowInventoryThreshold}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Batches with quantity at or below this threshold will trigger low inventory warnings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Interval (days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={newVerificationInterval}
                  onChange={(e) => setNewVerificationInterval(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                />
                <button
                  onClick={() => handleUpdateThreshold('verification', newVerificationInterval * 24 * 60 * 60)}
                  disabled={isUpdating || newVerificationInterval === Math.floor(thresholds.verificationInterval / (24 * 60 * 60))}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                How often batches should be re-verified for inventory accuracy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MdInventory size={28} className="text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-600">Monitor batch status, expiry dates, and inventory levels</p>
          </div>
        </div>
        
        <button
          onClick={loadInventoryData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <MdRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' && <MdCheck size={20} />}
          {message.type === 'error' && <MdError size={20} />}
          {message.type === 'info' && <MdInfo size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <MdInventory size={20} /> },
            { id: 'settings', label: 'Settings', icon: <MdSettings size={20} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && renderOverview()}
      {activeView === 'settings' && renderSettings()}
    </div>
  );
}