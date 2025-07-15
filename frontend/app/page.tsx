"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch } from "@/utils/types";

export default function Home() {
  const [featuredBatches, setFeaturedBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        // Show only verified batches as featured
        const verified = data.batches?.filter((b: CoffeeBatch) => b.verification.verificationStatus === 'verified').slice(0, 3) || [];
        setFeaturedBatches(verified);
      }
    } catch (error) {
      console.error('Error fetching featured batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBatches();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="web3-gradient-text">WAGA</span>{" "}
            <span className="text-white">Coffee Platform</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            The blockchain platform for premium coffee from Ethiopia. Farm-to-cup traceability with tokenized ownership and verifiable authenticity. ☕
          </p>
          
          {/* Role Selection */}
          <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
            <button
              onClick={() => window.location.href = '/browse'}
              className="web3-gradient-button px-8 py-4 text-center group"
            >
              <div className="text-lg font-semibold mb-1">🌱 Browse Coffee</div>
              <div className="text-xs opacity-75">Discover verified batches</div>
            </button>
            <button
              onClick={() => window.location.href = '/producer'}
              className="web3-gradient-button px-8 py-4 text-center group"
            >
              <div className="text-lg font-semibold mb-1">🏭 Producer Tools</div>
              <div className="text-xs opacity-75">Create & verify batches</div>
            </button>
            <button
              onClick={() => window.location.href = '/consumer'}
              className="web3-gradient-button-secondary px-8 py-4 text-center group"
            >
              <div className="text-lg font-semibold mb-1">👤 Consumer Portal</div>
              <div className="text-xs opacity-75">Manage tokens & deliveries</div>
            </button>
          </div>
        </div>

        {/* Featured Batches Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold web3-gradient-text mb-4">Featured Coffee Batches</h2>
            <p className="text-gray-400">Discover the latest verified coffee from our partner farms</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBatches.map((batch) => (
                <div key={batch.batchId} className="web3-card-dark hover:scale-105 transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {batch.batchDetails.farmName}
                    </h3>
                    <div className="text-purple-300 text-sm">
                      {batch.batchDetails.location}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Batch:</span>
                      <span className="text-white">#{batch.batchId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Packaging:</span>
                      <span className="text-purple-300">{batch.packaging}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-emerald-300">${batch.price}/bag</span>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = '/browse'}
                    className="w-full web3-gradient-button-secondary text-sm py-2"
                  >
                    🛒 View Details
                  </button>
                </div>
              ))}
            </div>
          )}

          {featuredBatches.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="text-lg font-medium text-white mb-2">No Featured Batches Yet</h3>
              <p className="text-gray-400">Check back soon for new verified coffee batches!</p>
            </div>
          )}
        </div>

        {/* Platform Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="web3-card text-center">
            <div className="text-4xl mb-4">⛓️</div>
            <h3 className="text-xl font-bold text-white mb-3">Blockchain Verified</h3>
            <p className="text-gray-400">Every batch is verified on-chain using Chainlink Functions for maximum transparency.</p>
          </div>
          
          <div className="web3-card text-center">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-xl font-bold text-white mb-3">IPFS Storage</h3>
            <p className="text-gray-400">Decentralized metadata storage ensures your batch information is permanent and tamper-proof.</p>
          </div>
          
          <div className="web3-card text-center">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-bold text-white mb-3">Token Redemption</h3>
            <p className="text-gray-400">Convert your coffee tokens into physical delivery of premium roasted beans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
                 