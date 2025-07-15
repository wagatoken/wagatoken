"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";
import Breadcrumbs from "../components/layout/Breadcrumbs";

export default function BrowsePage() {
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPackaging, setFilterPackaging] = useState<string>("all");

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

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batchDetails.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batchDetails.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackaging = filterPackaging === "all" || batch.packaging === filterPackaging;
    return matchesSearch && matchesPackaging;
  });

  const getStatusBadge = (batch: CoffeeBatch) => {
    const status = batch.verification.verificationStatus;
    const colors = {
      verified: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[status] || colors.failed;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold web3-gradient-text mb-2">
            Browse Coffee Batches
          </h1>
          <p className="text-gray-300">
            Discover premium roasted coffee from verified farms across Ethiopia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="web3-card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                🔍 Search Farms & Locations
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by farm name or location..."
                className="w-full web3-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-2">
                📦 Filter by Packaging
              </label>
              <select
                value={filterPackaging}
                onChange={(e) => setFilterPackaging(e.target.value)}
                className="w-full web3-select"
              >
                <option value="all">All Sizes</option>
                <option value="250g">250g Bags</option>
                <option value="500g">500g Bags</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <div key={batch.batchId} className="web3-card-dark hover:scale-105 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Batch #{batch.batchId}
                    </h3>
                    <div className="text-purple-300 text-sm">
                      {batch.batchDetails.farmName}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(batch)}`}>
                    {batch.verification.verificationStatus}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{batch.batchDetails.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Packaging:</span>
                    <span className="text-purple-300">{batch.packaging}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-emerald-300">${batch.price}/bag</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available:</span>
                    <span className="text-yellow-300">{batch.verification.inventoryActual} bags</span>
                  </div>
                  {batch.batchDetails.qualityScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Quality Score:</span>
                      <span className="text-white">{batch.batchDetails.qualityScore}/100</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-purple-500/20 pt-4">
                  <button
                    onClick={() => window.location.href = '/consumer'}
                    className="w-full web3-gradient-button-secondary text-sm py-2"
                    disabled={batch.verification.verificationStatus !== 'verified'}
                  >
                    {batch.verification.verificationStatus === 'verified' ? '🛒 Purchase Tokens' : '⏳ Pending Verification'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBatches.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-bold text-white mb-3">No Batches Found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
