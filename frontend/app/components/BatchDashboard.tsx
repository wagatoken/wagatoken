"use client";

import { CoffeeBatch } from "@/utils/types";
import ChainlinkVerification from "./ChainlinkVerification";
import { useState } from "react";

interface BatchDashboardProps {
  batches: CoffeeBatch[];
  onRefresh: () => void;
}

export default function BatchDashboard({ batches, onRefresh }: BatchDashboardProps) {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerificationComplete = (result: any) => {
    console.log('Verification completed:', result);
    // Refresh the batches when verification completes
    onRefresh();
    // Optionally close the verification panel
    // setSelectedBatch(null);
  };

  const toggleVerification = (batchId: number) => {
    if (selectedBatch === batchId && showVerificationPanel) {
      setSelectedBatch(null);
      setShowVerificationPanel(false);
    } else {
      setSelectedBatch(batchId);
      setShowVerificationPanel(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Coffee Batches</h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedBatch(null);
                setShowVerificationPanel(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Hide Verification
            </button>
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          No coffee batches found. Create your first batch to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Packaging
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr 
                  key={batch.batchId} 
                  className={`hover:bg-gray-50 ${selectedBatch === batch.batchId ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{batch.batchId}</div>
                    <div className="text-sm text-gray-500">ID: {batch.batchId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{batch.batchDetails.farmName}</div>
                    <div className="text-sm text-gray-500">{batch.batchDetails.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{batch.quantity} bags</div>
                    <div className="text-sm text-gray-500">Actual: {batch.verification.inventoryActual} bags</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${batch.price}</div>
                    <div className="text-sm text-gray-500">per bag</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {batch.packaging}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.verification.verificationStatus)}`}>
                      {batch.verification.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVerification(batch.batchId)}
                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                          selectedBatch === batch.batchId && showVerificationPanel
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {selectedBatch === batch.batchId && showVerificationPanel ? 'Hide' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chainlink Verification Panel */}
      {selectedBatch && showVerificationPanel && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <ChainlinkVerification 
            batchId={selectedBatch} 
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      )}
    </div>
  );
}
