"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";
import BatchForm from "../components/BatchForm";
import BatchDashboard from "../components/BatchDashboard";
import Breadcrumbs from "../components/layout/Breadcrumbs";

export default function ProducerPage() {
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold web3-gradient-text mb-2">
            Producer Dashboard
          </h1>
          <p className="text-gray-300">
            Create, manage, and verify your coffee batches on the blockchain
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="web3-card text-center">
            <div className="text-2xl font-bold web3-gradient-text">{batches.length}</div>
            <div className="text-purple-300 text-sm">Total Batches</div>
          </div>
          <div className="web3-card text-center">
            <div className="text-2xl font-bold text-green-300">
              {batches.filter(b => b.verification.verificationStatus === 'verified').length}
            </div>
            <div className="text-green-300 text-sm">Verified</div>
          </div>
          <div className="web3-card text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {batches.filter(b => b.verification.verificationStatus === 'pending').length}
            </div>
            <div className="text-yellow-300 text-sm">Pending</div>
          </div>
          <div className="web3-card text-center">
            <div className="text-2xl font-bold text-purple-300">
              {batches.reduce((sum, b) => sum + b.verification.inventoryActual, 0)}
            </div>
            <div className="text-purple-300 text-sm">Total Bags</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`${showForm ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'web3-gradient-button'} transition-all duration-300`}
              >
                {showForm ? '❌ Cancel' : '➕ Create New Coffee Batch'}
              </button>
            </div>

            {showForm && (
              <div className="max-w-4xl mx-auto">
                <BatchForm onBatchCreated={handleBatchCreated} />
              </div>
            )}

            <BatchDashboard batches={batches} onRefresh={fetchBatches} />
          </div>
        )}
      </div>
    </div>
  );
}
