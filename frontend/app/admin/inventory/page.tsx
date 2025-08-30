'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  MdInventory, 
  MdSchedule, 
  MdWarning, 
  MdCheckCircle, 
  MdError,
  MdRefresh,
  MdSettings,
  MdHistory,
  MdNotifications
} from 'react-icons/md';

interface InventoryBatch {
  batchId: number;
  name: string;
  quantity: number;
  mintedQuantity: number;
  availableQuantity: number;
  lastVerified: number;
  nextVerification: number;
  status: 'verified' | 'pending' | 'expired' | 'low_inventory' | 'long_storage';
  alerts: string[];
}

interface VerificationConfig {
  batchAuditInterval: number;
  expiryWarningThreshold: number;
  lowInventoryThreshold: number;
  longStorageThreshold: number;
  maxBatchesPerUpkeep: number;
  intervalSeconds: number;
}

interface VerificationHistory {
  batchId: number;
  verificationType: string;
  timestamp: number;
  result: 'success' | 'failed';
  details: string;
}

function InventoryManagementPage() {
  const { address, isConnected } = useAccount();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Inventory data
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [config, setConfig] = useState<VerificationConfig | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistory[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showManualVerificationModal, setShowManualVerificationModal] = useState(false);

  // Load user role and inventory data
  useEffect(() => {
    if (isConnected && address) {
      loadUserRole();
      loadInventoryData();
      loadVerificationConfig();
      loadVerificationHistory();
    }
  }, [isConnected, address]);

  const loadUserRole = async () => {
    try {
      // Check if user has admin role
      const response = await fetch('/api/waga/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (err) {
      console.error('Error loading user role:', err);
    }
  };

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/waga/inventory/batches');
      
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches);
      } else {
        setError('Failed to load inventory data');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationConfig = async () => {
    try {
      const response = await fetch('/api/waga/inventory/config');
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Error loading verification config:', err);
    }
  };

  const loadVerificationHistory = async () => {
    try {
      const response = await fetch('/api/waga/inventory/history');
      
      if (response.ok) {
        const data = await response.json();
        setVerificationHistory(data.history);
      }
    } catch (err) {
      console.error('Error loading verification history:', err);
    }
  };

  const triggerManualVerification = async (batchId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/waga/inventory/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId })
      });
      
      if (response.ok) {
        setSuccess(`Manual verification triggered for batch ${batchId}`);
        await loadInventoryData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to trigger verification');
      }
    } catch (err) {
      console.error('Error triggering verification:', err);
      setError('Failed to trigger verification');
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationConfig = async (newConfig: Partial<VerificationConfig>) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/waga/inventory/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (response.ok) {
        setSuccess('Verification configuration updated successfully');
        await loadVerificationConfig(); // Refresh config
        setShowConfigModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update configuration');
      }
    } catch (err) {
      console.error('Error updating config:', err);
      setError('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'low_inventory': return 'text-orange-600 bg-orange-100';
      case 'long_storage': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <MdCheckCircle className="w-4 h-4" />;
      case 'pending': return <MdSchedule className="w-4 h-4" />;
      case 'expired': return <MdError className="w-4 h-4" />;
      case 'low_inventory': return <MdWarning className="w-4 h-4" />;
      case 'long_storage': return <MdWarning className="w-4 h-4" />;
      default: return <MdInventory className="w-4 h-4" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access inventory management.</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access inventory management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Monitor and control periodic inventory verifications</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <MdSettings className="w-4 h-4 mr-2" />
                Configuration
              </button>
              <button
                onClick={loadInventoryData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <MdRefresh className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <MdInventory /> },
              { id: 'verifications', label: 'Verifications', icon: <MdCheckCircle /> },
              { id: 'alerts', label: 'Alerts', icon: <MdWarning /> },
              { id: 'history', label: 'History', icon: <MdHistory /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MdInventory className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Batches</p>
                    <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MdCheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {batches.filter(b => b.status === 'verified').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MdWarning className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {batches.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MdError className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {batches.filter(b => b.alerts.length > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Inventory Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Minted Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.batchId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{batch.batchId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.mintedQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {batch.availableQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {getStatusIcon(batch.status)}
                            <span className="ml-1 capitalize">{batch.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(batch.lastVerified * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedBatch(batch.batchId);
                              setShowManualVerificationModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Verify Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Verification Status</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Automated verification system is running via Chainlink Automation.</p>
              {config && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Configuration</h4>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Batch Audit Interval:</dt>
                        <dd className="text-sm text-gray-900">{config.batchAuditInterval / 86400} days</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Expiry Warning:</dt>
                        <dd className="text-sm text-gray-900">{config.expiryWarningThreshold / 86400} days</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Low Inventory Threshold:</dt>
                        <dd className="text-sm text-gray-900">{config.lowInventoryThreshold} units</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Long Storage Threshold:</dt>
                        <dd className="text-sm text-gray-900">{config.longStorageThreshold / 86400} days</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {batches.filter(b => b.alerts.length > 0).map((batch) => (
              <div key={batch.batchId} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Batch #{batch.batchId} - {batch.name}</h4>
                    <p className="text-sm text-gray-600">Status: {batch.status}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch.batchId);
                      setShowManualVerificationModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Verify Now
                  </button>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Alerts:</h5>
                  <ul className="space-y-1">
                    {batch.alerts.map((alert, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center">
                        <MdWarning className="w-4 h-4 mr-2" />
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            
            {batches.filter(b => b.alerts.length > 0).length === 0 && (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <MdCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
                <p className="text-gray-600">All batches are currently in good standing.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Verification History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verificationHistory.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.timestamp * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.batchId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.verificationType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.result === 'success' 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        }`}>
                          {item.result === 'success' ? <MdCheckCircle className="w-4 h-4 mr-1" /> : <MdError className="w-4 h-4 mr-1" />}
                          {item.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && config && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Configuration</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateVerificationConfig({
                  batchAuditInterval: parseInt(formData.get('batchAuditInterval') as string) * 86400,
                  expiryWarningThreshold: parseInt(formData.get('expiryWarningThreshold') as string) * 86400,
                  lowInventoryThreshold: parseInt(formData.get('lowInventoryThreshold') as string),
                  longStorageThreshold: parseInt(formData.get('longStorageThreshold') as string) * 86400,
                  maxBatchesPerUpkeep: parseInt(formData.get('maxBatchesPerUpkeep') as string),
                  intervalSeconds: parseInt(formData.get('intervalSeconds') as string) * 3600
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Audit Interval (days)</label>
                    <input
                      type="number"
                      name="batchAuditInterval"
                      defaultValue={config.batchAuditInterval / 86400}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Warning Threshold (days)</label>
                    <input
                      type="number"
                      name="expiryWarningThreshold"
                      defaultValue={config.expiryWarningThreshold / 86400}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Low Inventory Threshold (units)</label>
                    <input
                      type="number"
                      name="lowInventoryThreshold"
                      defaultValue={config.lowInventoryThreshold}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Long Storage Threshold (days)</label>
                    <input
                      type="number"
                      name="longStorageThreshold"
                      defaultValue={config.longStorageThreshold / 86400}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Batches Per Upkeep</label>
                    <input
                      type="number"
                      name="maxBatchesPerUpkeep"
                      defaultValue={config.maxBatchesPerUpkeep}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Automation Interval (hours)</label>
                    <input
                      type="number"
                      name="intervalSeconds"
                      defaultValue={config.intervalSeconds / 3600}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Update Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Verification Modal */}
      {showManualVerificationModal && selectedBatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Trigger manual inventory verification for batch #{selectedBatch}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowManualVerificationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    triggerManualVerification(selectedBatch);
                    setShowManualVerificationModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Trigger Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagementPage;
