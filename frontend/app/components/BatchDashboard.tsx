"use client";

import { CoffeeBatch } from "@/utils/types";
import ChainlinkVerification from "./ChainlinkVerification";
import { useState } from "react";
import { CoffeeBeanIcon } from './icons/WagaIcons';
import { MdVerified, MdLock } from 'react-icons/md';
import { FaLink } from 'react-icons/fa';

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
    <div className="web3-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold web3-gradient-text">Coffee Batches</h2>
          <p className="text-gray-400 mt-1">Manage and verify your inventory on the blockchain</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedBatch(null);
              setShowVerificationPanel(false);
            }}
            className="text-purple-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-purple-500/20"
          >
            Hide Verification
          </button>
          <button
            onClick={onRefresh}
            className="web3-gradient-button"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-6">
            <CoffeeBeanIcon size={64} className="waga-icon-coffee" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">No Coffee Batches Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">Create your first batch of premium coffee to start tokenizing your inventory.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Farm Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Packaging
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {batches.map((batch) => (
                <tr 
                  key={batch.batchId} 
                  className={`hover:bg-purple-500/10 transition-colors ${selectedBatch === batch.batchId ? 'bg-purple-500/20' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">#{batch.batchId}</div>
                    <div className="text-sm text-gray-400">Batch ID: {batch.batchId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{batch.batchDetails.farmName}</div>
                    <div className="text-sm text-purple-300">📍 {batch.batchDetails.location}</div>
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
                    <button
                      onClick={() => toggleVerification(batch.batchId)}
                      className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all duration-300 ${
                        selectedBatch === batch.batchId && showVerificationPanel
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                          : 'web3-gradient-button'
                      }`}
                    >
                      {selectedBatch === batch.batchId && showVerificationPanel ? (
                        <>
                          <MdLock size={16} />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <FaLink size={16} />
                          <span>Verify</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chainlink Verification Panel */}
      {selectedBatch && showVerificationPanel && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-400/30">
          <ChainlinkVerification 
            batchId={selectedBatch} 
            onVerificationComplete={handleVerificationComplete}
          />
        </div>
      )}
    </div>
  );
}
