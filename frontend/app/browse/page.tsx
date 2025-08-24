"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";
import { MdCoffee, MdVerified, MdShoppingCart, MdHourglassTop } from "react-icons/md";
import Breadcrumbs from "../components/layout/Breadcrumbs";

export default function BrowsePage() {
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPackaging, setFilterPackaging] = useState<string>("all");

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches/');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched batches:', data.batches?.length || 0, 'batches');
        setBatches(data.batches || []);
      } else {
        console.error('Failed to fetch batches:', response.status, response.statusText);
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
      verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.failed;
  };

  return (
    <div className="web3-page-spacing min-h-screen web3-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8 animate-card-entrance">
          <h1 className="flex items-center gap-3 text-4xl font-bold web3-gradient-text mb-2">
            <MdCoffee size={36} className="text-amber-600" />
            Browse Coffee Batches
          </h1>
          <p className="text-gray-600">
            Discover premium roasted coffee from verified farms
          </p>
        </div>

        {/* Search and Filters */}
        <div className="web3-card mb-8 animate-card-entrance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Search Farms & Locations
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
              <label className="block text-sm font-semibold text-emerald-700 mb-2">
                Filter by Packaging
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch, index) => (
              <div 
                key={batch.batchId} 
                className="web3-card-dark hover:scale-105 transition-all duration-300 animate-card-entrance"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-1">
                      <MdCoffee size={18} className="text-amber-600" />
                      Batch #{batch.batchId}
                    </h3>
                    <div className="text-amber-700 text-sm font-medium">
                      {batch.batchDetails.farmName}
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(batch)}`}>
                    <MdVerified size={12} />
                    {batch.verification.verificationStatus}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="text-gray-900 font-medium">{batch.batchDetails.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Packaging:</span>
                    <span className="text-amber-700 font-medium">{batch.packaging}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-emerald-700 font-bold">${batch.price}/bag</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="text-amber-600 font-medium">{batch.verification.inventoryActual} bags</span>
                  </div>
                  {batch.batchDetails.qualityScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quality Score:</span>
                      <span className="text-gray-900 font-bold">{batch.batchDetails.qualityScore}/100</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-amber-200/50 pt-4">
                  <button
                    onClick={() => window.location.href = '/consumer'}
                    className="w-full web3-gradient-button-secondary text-sm py-2 flex items-center justify-center gap-2"
                    disabled={batch.verification.verificationStatus !== 'verified'}
                  >
                    {batch.verification.verificationStatus === 'verified' ? (
                      <>
                        <MdShoppingCart size={16} />
                        Purchase Tokens
                      </>
                    ) : (
                      <>
                        <MdHourglassTop size={16} />
                        Pending Verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBatches.length === 0 && !loading && (
          <div className="text-center py-12 animate-card-entrance">
            <div className="text-6xl mb-4 animate-coffee-bounce">
              <MdCoffee size={72} className="text-amber-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Batches Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
