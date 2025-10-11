'use client';

import React, { useState, useEffect } from 'react';
import {
  MdCoffee,
  MdVisibility,
  MdEdit,
  MdVerifiedUser,
  MdLocationOn,
  MdDateRange,
  MdScale,
  MdAttachMoney,
  MdSecurity,
  MdDownload,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdAdd,
  MdInfo,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdPendingActions,
  MdStorage,
  MdPrivacyTip,
  MdVerified,
  MdGavel,
  MdLocalShipping,
  MdAssignmentTurnedIn
} from 'react-icons/md';
import {
  getActiveBatchIds,
  getBatchInfo,
  getBatchInfoWithMetadata,
  getUserBatchBalance,
  getBatchPrivacyConfig,
  getComplianceStatus
} from '../utils/smartContracts';

interface BatchDetails {
  id: string;
  productionDate: Date;
  expiryDate: Date;
  quantity: number;
  pricePerUnit: number;
  packagingInfo: string;
  metadataHash: string;
  isVerified: boolean;
  lastVerifiedTimestamp: Date;
  balance?: number;
  privacyConfig?: {
    pricingLevel: number;
    qualityLevel: number;
    supplyChainLevel: number;
    creator: string;
    hasPricePrivacy: boolean;
    hasQualityPrivacy: boolean;
    hasSupplyChainPrivacy: boolean;
  };
  complianceStatus?: {
    hasECTA: boolean;
    hasQuality: boolean;
    hasOrigin: boolean;
    isFullyCompliant: boolean;
  };
  metadata?: any;
}

interface BatchManagerProps {
  userRole?: 'ADMIN' | 'BATCH_CREATOR' | 'COMPLIANCE_MANAGER' | 'EXPORTER' | 'BUYER';
  showCreateButton?: boolean;
  onCreateBatch?: () => void;
}

export default function EnhancedBatchManager({ 
  userRole = 'BATCH_CREATOR',
  showCreateButton = true,
  onCreateBatch 
}: BatchManagerProps) {
  const [batches, setBatches] = useState<BatchDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending' | 'compliance'>('all');
  const [selectedBatch, setSelectedBatch] = useState<BatchDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState('');

  // Load all batches
  const loadBatches = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📦 Loading batch information...');

      const batchIds = await getActiveBatchIds();
      console.log('Found batch IDs:', batchIds);

      const batchDetails: BatchDetails[] = [];
      
      for (const batchId of batchIds.slice(0, 10)) { // Load first 10 for performance
        try {
          console.log(`Loading details for batch ${batchId}...`);
          
          // Get basic batch info
          const batchInfo = await getBatchInfo(batchId);
          console.log(`Batch ${batchId} info:`, batchInfo);

          // Get user balance for this batch
          let balance = 0;
          try {
            balance = await getUserBatchBalance(batchId);
          } catch (balanceError) {
            console.log(`Could not get balance for batch ${batchId}:`, balanceError);
          }

          // Get privacy configuration
          let transformedPrivacyConfig;
          try {
            const privacyConfig = await getBatchPrivacyConfig(batchId);
            transformedPrivacyConfig = {
              ...privacyConfig,
              hasPricePrivacy: privacyConfig.pricingLevel > 0,
              hasQualityPrivacy: privacyConfig.qualityLevel > 0,
              hasSupplyChainPrivacy: privacyConfig.supplyChainLevel > 0
            };
          } catch (privacyError) {
            console.log(`Could not get privacy config for batch ${batchId}:`, privacyError);
          }

          // Get compliance status
          let transformedComplianceStatus;
          try {
            const complianceStatus = await getComplianceStatus(batchId);
            transformedComplianceStatus = complianceStatus || undefined;
          } catch (complianceError) {
            console.log(`Could not get compliance status for batch ${batchId}:`, complianceError);
          }

          const batchDetail: BatchDetails = {
            id: batchId,
            productionDate: new Date(Number(batchInfo.productionDate) * 1000),
            expiryDate: new Date(Number(batchInfo.expiryDate) * 1000),
            quantity: Number(batchInfo.quantity),
            pricePerUnit: Number(batchInfo.pricePerUnit) / 1e6, // Convert from micro units
            packagingInfo: batchInfo.packagingInfo,
            metadataHash: batchInfo.metadataHash,
            isVerified: batchInfo.isVerified || false,
            lastVerifiedTimestamp: new Date(Number(batchInfo.lastVerifiedTimestamp) * 1000),
            balance,
            privacyConfig: transformedPrivacyConfig,
            complianceStatus: transformedComplianceStatus
          };

          batchDetails.push(batchDetail);
          
        } catch (batchError) {
          console.error(`Error loading batch ${batchId}:`, batchError);
        }
      }

      setBatches(batchDetails);
      console.log('✅ Batches loaded successfully:', batchDetails);

    } catch (error) {
      console.error('❌ Error loading batches:', error);
      setError('Failed to load batches. Please check your connection and try again.');
      
      // Mock data for development
      const mockBatches: BatchDetails[] = [
        {
          id: '1001',
          productionDate: new Date('2024-01-15'),
          expiryDate: new Date('2024-12-15'),
          quantity: 100,
          pricePerUnit: 25.50,
          packagingInfo: '60kg bags',
          metadataHash: 'QmMockHash1...',
          isVerified: true,
          lastVerifiedTimestamp: new Date('2024-01-20'),
          balance: 25,
          privacyConfig: {
            pricingLevel: 2,
            qualityLevel: 0,
            supplyChainLevel: 1,
            creator: '0x1234567890abcdef1234567890abcdef12345678',
            hasPricePrivacy: true,
            hasQualityPrivacy: false,
            hasSupplyChainPrivacy: true
          },
          complianceStatus: {
            hasECTA: true,
            hasQuality: true,
            hasOrigin: true,
            isFullyCompliant: true
          }
        },
        {
          id: '1002',
          productionDate: new Date('2024-01-10'),
          expiryDate: new Date('2024-12-10'),
          quantity: 150,
          pricePerUnit: 28.00,
          packagingInfo: '60kg bags',
          metadataHash: 'QmMockHash2...',
          isVerified: false,
          lastVerifiedTimestamp: new Date('2024-01-15'),
          balance: 0,
          privacyConfig: {
            pricingLevel: 0,
            qualityLevel: 1,
            supplyChainLevel: 0,
            creator: '0x1234567890abcdef1234567890abcdef12345678',
            hasPricePrivacy: false,
            hasQualityPrivacy: true,
            hasSupplyChainPrivacy: false
          },
          complianceStatus: {
            hasECTA: true,
            hasQuality: false,
            hasOrigin: true,
            isFullyCompliant: false
          }
        }
      ];
      setBatches(mockBatches);
      
    } finally {
      setLoading(false);
    }
  };

  // Filter batches based on search and status
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.packagingInfo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterStatus) {
        case 'verified':
          return batch.isVerified;
        case 'pending':
          return !batch.isVerified;
        case 'compliance':
          return batch.complianceStatus?.isFullyCompliant || false;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  // Load detailed batch information including metadata
  const loadBatchDetails = async (batchId: string) => {
    try {
      setLoading(true);
      console.log(`📋 Loading detailed information for batch ${batchId}...`);

      const detailedInfo = await getBatchInfoWithMetadata(batchId);
      
      // Find the batch in our current list and update it
      const updatedBatch = batches.find(b => b.id === batchId);
      if (updatedBatch) {
        updatedBatch.metadata = detailedInfo.metadata;
        setSelectedBatch(updatedBatch);
        setShowDetails(true);
      }

    } catch (error) {
      console.error(`❌ Error loading batch details for ${batchId}:`, error);
      setError(`Failed to load details for batch ${batchId}`);
    } finally {
      setLoading(false);
    }
  };

  // Load batches on component mount
  useEffect(() => {
    loadBatches();
  }, []);

  const getStatusIcon = (batch: BatchDetails) => {
    if (batch.isVerified && batch.complianceStatus?.isFullyCompliant) {
      return <MdCheckCircle className="text-green-500" size={20} />;
    } else if (batch.isVerified) {
      return <MdVerified className="text-blue-500" size={20} />;
    } else if (batch.complianceStatus?.hasECTA || batch.complianceStatus?.hasQuality) {
      return <MdPendingActions className="text-yellow-500" size={20} />;
    } else {
      return <MdWarning className="text-red-500" size={20} />;
    }
  };

  const getStatusText = (batch: BatchDetails) => {
    if (batch.isVerified && batch.complianceStatus?.isFullyCompliant) {
      return 'Verified & Compliant';
    } else if (batch.isVerified) {
      return 'Verified';
    } else if (batch.complianceStatus?.hasECTA || batch.complianceStatus?.hasQuality) {
      return 'Partial Compliance';
    } else {
      return 'Pending Verification';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MdCoffee size={32} className="text-brown-600" />
              Enhanced Batch Management
            </h1>
            <p className="text-gray-600">
              View, manage, and track coffee batches with compliance and privacy features
            </p>
          </div>
          
          {showCreateButton && (
            <button
              onClick={onCreateBatch}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <MdAdd size={20} />
              <span>Create New Batch</span>
            </button>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search batches by ID or packaging info..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Batches</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
              <option value="compliance">Fully Compliant</option>
            </select>
          </div>
          
          <button
            onClick={loadBatches}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <MdRefresh size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <MdError size={20} className="text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading batches...</span>
        </div>
      )}

      {/* Batch Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => (
            <div key={batch.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Batch Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MdCoffee className="text-brown-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Batch #{batch.id}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(batch)}
                  <span className="text-xs text-gray-600">{getStatusText(batch)}</span>
                </div>
              </div>

              {/* Batch Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MdScale className="text-gray-400" size={16} />
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{batch.quantity} bags</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MdAttachMoney className="text-gray-400" size={16} />
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">${batch.pricePerUnit.toFixed(2)}/unit</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MdDateRange className="text-gray-400" size={16} />
                  <span className="text-gray-600">Production:</span>
                  <span className="font-medium">{batch.productionDate.toLocaleDateString()}</span>
                </div>

                {batch.balance !== undefined && batch.balance > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <MdStorage className="text-gray-400" size={16} />
                    <span className="text-gray-600">Your Balance:</span>
                    <span className="font-medium text-green-600">{batch.balance} tokens</span>
                  </div>
                )}
              </div>

              {/* Privacy & Compliance Indicators */}
              <div className="flex flex-wrap gap-2 mb-4">
                {batch.privacyConfig?.hasPricePrivacy && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                    <MdPrivacyTip size={12} />
                    Price Privacy
                  </span>
                )}
                
                {batch.privacyConfig?.hasQualityPrivacy && (
                  <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1">
                    <MdSecurity size={12} />
                    Quality Privacy
                  </span>
                )}
                
                {batch.complianceStatus?.hasECTA && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <MdGavel size={12} />
                    ECTA
                  </span>
                )}
                
                {batch.complianceStatus?.hasOrigin && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                    <MdLocationOn size={12} />
                    Origin Verified
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => loadBatchDetails(batch.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <MdVisibility size={16} />
                  <span>View Details</span>
                </button>
                
                {(userRole === 'ADMIN' || userRole === 'BATCH_CREATOR') && (
                  <button
                    onClick={() => {/* TODO: Implement edit functionality */}}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <MdEdit size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <MdCoffee size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first coffee batch to get started.'
            }
          </p>
          {showCreateButton && !searchTerm && filterStatus === 'all' && (
            <button
              onClick={onCreateBatch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <MdAdd size={20} />
              <span>Create First Batch</span>
            </button>
          )}
        </div>
      )}

      {/* Batch Details Modal */}
      {showDetails && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MdCoffee size={28} className="text-brown-600" />
                  Batch #{selectedBatch.id} Details
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Production Date:</span>
                      <span className="font-medium">{selectedBatch.productionDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">{selectedBatch.expiryDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedBatch.quantity} bags</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Unit:</span>
                      <span className="font-medium">${selectedBatch.pricePerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Packaging:</span>
                      <span className="font-medium">{selectedBatch.packagingInfo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification Status:</span>
                      <span className={`font-medium ${selectedBatch.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedBatch.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Compliance Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ECTA Permit:</span>
                      <div className="flex items-center gap-2">
                        {selectedBatch.complianceStatus?.hasECTA ? (
                          <MdCheckCircle className="text-green-500" size={20} />
                        ) : (
                          <MdError className="text-red-500" size={20} />
                        )}
                        <span className={selectedBatch.complianceStatus?.hasECTA ? 'text-green-600' : 'text-red-600'}>
                          {selectedBatch.complianceStatus?.hasECTA ? 'Available' : 'Missing'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Quality Certificate:</span>
                      <div className="flex items-center gap-2">
                        {selectedBatch.complianceStatus?.hasQuality ? (
                          <MdCheckCircle className="text-green-500" size={20} />
                        ) : (
                          <MdError className="text-red-500" size={20} />
                        )}
                        <span className={selectedBatch.complianceStatus?.hasQuality ? 'text-green-600' : 'text-red-600'}>
                          {selectedBatch.complianceStatus?.hasQuality ? 'Available' : 'Missing'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Origin Verification:</span>
                      <div className="flex items-center gap-2">
                        {selectedBatch.complianceStatus?.hasOrigin ? (
                          <MdCheckCircle className="text-green-500" size={20} />
                        ) : (
                          <MdError className="text-red-500" size={20} />
                        )}
                        <span className={selectedBatch.complianceStatus?.hasOrigin ? 'text-green-600' : 'text-red-600'}>
                          {selectedBatch.complianceStatus?.hasOrigin ? 'Available' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Configuration */}
              {selectedBatch.privacyConfig && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <MdPrivacyTip size={20} />
                    Privacy Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      {selectedBatch.privacyConfig.hasPricePrivacy ? (
                        <MdCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <MdError className="text-gray-400" size={16} />
                      )}
                      <span className="text-purple-800">Price Privacy</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedBatch.privacyConfig.hasQualityPrivacy ? (
                        <MdCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <MdError className="text-gray-400" size={16} />
                      )}
                      <span className="text-purple-800">Quality Privacy</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedBatch.privacyConfig.hasSupplyChainPrivacy ? (
                        <MdCheckCircle className="text-green-500" size={16} />
                      ) : (
                        <MdError className="text-gray-400" size={16} />
                      )}
                      <span className="text-purple-800">Supply Chain Privacy</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Information */}
              {selectedBatch.metadata && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MdInfo size={20} />
                    Metadata
                  </h3>
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedBatch.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                
                {(userRole === 'ADMIN' || userRole === 'COMPLIANCE_MANAGER') && (
                  <button
                    onClick={() => {/* TODO: Implement compliance management */}}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Manage Compliance
                  </button>
                )}
                
                <button
                  onClick={() => {/* TODO: Implement export functionality */}}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <MdDownload size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}