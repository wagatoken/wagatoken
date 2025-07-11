"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";
import BatchForm from "./components/BatchForm";
import BatchDashboard from "./components/BatchDashboard";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      } else {
        console.error('Failed to fetch batches');
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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WAGA Coffee Traceability Dashboard
          </h1>
          <p className="text-gray-600">
            Manage coffee batches with Chainlink Functions verification and IPFS storage via Pinata
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Coffee Batch'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <BatchForm onBatchCreated={handleBatchCreated} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <BatchDashboard batches={batches} onRefresh={fetchBatches} />
        )}
      </div>
    </main>
  );
}
