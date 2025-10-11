'use client';

import React, { useState } from 'react';
import {
  MdCoffee,
  MdAdd,
  MdViewList,
  MdDashboard,
  MdSecurity,
  MdVerifiedUser,
  MdAnalytics,
  MdSettings
} from 'react-icons/md';
import ZKBatchCreator from './ZKBatchCreator';
import EnhancedBatchManager from './EnhancedBatchManager';

interface BatchDashboardProps {
  userRole?: 'ADMIN' | 'BATCH_CREATOR' | 'COMPLIANCE_MANAGER' | 'EXPORTER' | 'BUYER';
  defaultTab?: 'overview' | 'create' | 'manage' | 'analytics';
}

export default function BatchManagementDashboard({ 
  userRole = 'BATCH_CREATOR',
  defaultTab = 'overview' 
}: BatchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'analytics'>(defaultTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBatchCreated = (result: any) => {
    console.log('✅ New batch created:', result);
    // Refresh the batch manager when a new batch is created
    setRefreshKey(prev => prev + 1);
    // Switch to manage tab to show the new batch
    setActiveTab('manage');
  };

  const handleCreateNewBatch = () => {
    setActiveTab('create');
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Dashboard Overview',
      icon: <MdDashboard size={20} />,
      description: 'System overview and quick stats'
    },
    {
      id: 'create' as const,
      label: 'Create Batch',
      icon: <MdAdd size={20} />,
      description: 'Create new coffee batches with ZK privacy'
    },
    {
      id: 'manage' as const,
      label: 'Manage Batches',
      icon: <MdViewList size={20} />,
      description: 'View and manage existing batches'
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: <MdAnalytics size={20} />,
      description: 'Batch performance and compliance analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdCoffee size={32} className="text-brown-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  WAGA Batch Management
                </h1>
                <p className="text-sm text-gray-600">
                  Complete coffee batch lifecycle management with privacy and compliance
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Role:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick Stats Cards */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Batches</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                  <MdCoffee className="text-brown-600" size={32} />
                </div>
                <p className="text-xs text-green-600 mt-2">↗ 12% from last month</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified Batches</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                  </div>
                  <MdVerifiedUser className="text-green-600" size={32} />
                </div>
                <p className="text-xs text-gray-600 mt-2">75% verification rate</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Privacy Enabled</p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                  <MdSecurity className="text-purple-600" size={32} />
                </div>
                <p className="text-xs text-gray-600 mt-2">62% use ZK privacy</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                  </div>
                  <MdSettings className="text-blue-600" size={32} />
                </div>
                <p className="text-xs text-green-600 mt-2">Above target (85%)</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MdAdd className="text-green-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-green-900">Create New Batch</p>
                    <p className="text-sm text-green-700">Start with ZK privacy features</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('manage')}
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <MdViewList className="text-blue-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">Manage Batches</p>
                    <p className="text-sm text-blue-700">View and update existing batches</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <MdAnalytics className="text-purple-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-purple-900">View Analytics</p>
                    <p className="text-sm text-purple-700">Performance and compliance insights</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MdAdd className="text-green-600" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Batch #1003 created</p>
                    <p className="text-xs text-gray-600">Premium Yirgacheffe with privacy features - 2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MdVerifiedUser className="text-blue-600" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Batch #1001 verified</p>
                    <p className="text-xs text-gray-600">Chainlink verification completed - 4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MdSecurity className="text-purple-600" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Privacy proof generated</p>
                    <p className="text-xs text-gray-600">ZK proof for Batch #1002 pricing - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Batch Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Coffee Batch</h2>
                <p className="text-gray-600">
                  Create a new coffee batch with optional ZK privacy features for sensitive business information.
                </p>
              </div>
              
              <ZKBatchCreator onBatchCreated={handleBatchCreated} />
            </div>
          </div>
        )}

        {/* Manage Batches Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <EnhancedBatchManager
              key={refreshKey} // Force re-render when batch created
              userRole={userRole}
              showCreateButton={true}
              onCreateBatch={handleCreateNewBatch}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Batch Performance Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Overview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Compliance Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ECTA Permits</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quality Certificates</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Origin Verification</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Adoption */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Privacy Feature Adoption</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price Privacy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Quality Privacy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                        </div>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Supply Chain Privacy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                        <span className="text-sm font-medium">58%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                  <p className="text-sm text-gray-600">Batch Creation</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">+8%</p>
                  <p className="text-sm text-gray-600">Verification Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">+23%</p>
                  <p className="text-sm text-gray-600">Privacy Adoption</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}