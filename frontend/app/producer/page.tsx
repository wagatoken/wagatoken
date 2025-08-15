"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";
import BatchForm from "../components/BatchForm";
import BatchDashboard from "../components/BatchDashboard";

export default function VendorPage() {
  const [showForm, setShowForm] = useState(false);
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchCreated = (newBatch: CoffeeBatch) => {
    setBatches(prev => [newBatch, ...prev]);
    setShowForm(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-card-entrance">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-float">�️</div>
            <h1 className="text-4xl font-bold web3-gradient-text mb-4">
              WAGA Admin Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Administrative interface for WAGA staff to create, manage, and verify coffee batches 
              on the blockchain with complete transparency and traceability
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="web3-stat-card group animate-card-entrance">
              <div className="text-4xl mb-2 group-hover:animate-pulse">📦</div>
              <div className="text-3xl font-bold web3-gradient-text mb-1">{batches.length}</div>
              <div className="text-gray-600 font-medium">Total Batches</div>
            </div>
            <div className="web3-stat-card group animate-card-entrance" style={{ animationDelay: '100ms' }}>
              <div className="text-4xl mb-2 group-hover:animate-pulse">✅</div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {batches.filter(b => b.verification.verificationStatus === 'verified').length}
              </div>
              <div className="text-emerald-600 font-medium">Verified</div>
            </div>
            <div className="web3-stat-card group animate-card-entrance" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl mb-2 group-hover:animate-pulse">⏳</div>
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {batches.filter(b => b.verification.verificationStatus === 'pending').length}
              </div>
              <div className="text-amber-600 font-medium">Pending</div>
            </div>
            <div className="web3-stat-card group animate-card-entrance" style={{ animationDelay: '300ms' }}>
              <div className="text-4xl mb-2 group-hover:animate-pulse">☕</div>
              <div className="text-3xl font-bold text-emerald-700 mb-1">
                {batches.reduce((sum, b) => sum + b.verification.inventoryActual, 0)}
              </div>
              <div className="text-emerald-700 font-medium">Total Bags</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center animate-card-entrance">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">Loading your coffee batches...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Create New Batch Button */}
            <div className="text-center animate-card-entrance">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${
                  showForm 
                    ? 'bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold px-8 py-4 transition-all duration-300 transform hover:scale-105' 
                    : 'web3-gradient-button text-lg'
                } px-8 py-4 transition-all duration-300`}
              >
                {showForm ? '❌ Cancel Creation' : '➕ Create New Coffee Batch'}
              </button>
            </div>

            {/* Batch Creation Form */}
            {showForm && (
              <div className="web3-card animate-card-entrance">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Coffee Batch</h2>
                  <p className="text-gray-600">
                    Fill in the details below to create a new verified coffee batch on the blockchain
                  </p>
                </div>
                <BatchForm onBatchCreated={handleBatchCreated} />
              </div>
            )}

            {/* Batch Dashboard */}
            <div className="web3-card animate-card-entrance">
              <div className="pb-6 border-b border-emerald-200/50 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">WAGA Coffee Batches</h2>
                <p className="text-gray-600 mt-1">
                  Manage and track all WAGA-verified coffee batches in one place
                </p>
              </div>
              <BatchDashboard batches={batches} onRefresh={fetchBatches} />
            </div>

            {/* Help Section */}
            <div className="web3-card-dark animate-card-entrance">
              <div className="flex items-start space-x-4">
                <div className="text-4xl animate-pulse-emerald">💡</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Instructions</h3>
                  <p className="text-gray-700 mb-4">
                    As a WAGA administrator, here's how to create a new verified coffee batch:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Click "Create New Coffee Batch" above</li>
                    <li>Fill in farm details and coffee specifications from partner farmers</li>
                    <li>Upload photos and certification documents to IPFS</li>
                    <li>Submit for automated Chainlink verification</li>
                    <li>Once verified, tokens will be available for consumer purchase</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
