"use client";

import { useState, useEffect } from "react";
import { CoffeeBatch, RedemptionRequest, UserTokenBalance } from "@/utils/types";
import BatchForm from "./components/BatchForm";
import BatchDashboard from "./components/BatchDashboard";
import RedemptionForm from "./components/RedemptionForm";
import RedemptionDashboard from "./components/RedemptionDashboard";
import TokenBalanceCard from "./components/TokenBalanceCard";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'batches' | 'redemptions'>('batches');
  const [batches, setBatches] = useState<CoffeeBatch[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [userBalances, setUserBalances] = useState<UserTokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user address - in production this would come from wallet connection
  const userAddress = "0x742d35Cc6634C0532925a3b8D581C2532D8b8132";

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const response = await fetch(`/api/redemptions?userAddress=${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const fetchUserBalances = async () => {
    try {
      const response = await fetch(`/api/user/tokens?userAddress=${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        setUserBalances(data.balances || []);
      }
    } catch (error) {
      console.error('Error fetching user balances:', error);
    }
  };

  const handleBatchCreated = (newBatch: CoffeeBatch) => {
    setBatches(prev => [newBatch, ...prev]);
    setShowForm(false);
  };

  const handleRedemptionCreated = (newRedemption: RedemptionRequest) => {
    setRedemptions(prev => [newRedemption, ...prev]);
    // Refresh balances as they may have changed
    fetchUserBalances();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBatches(), fetchRedemptions(), fetchUserBalances()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold mb-4">
            <span className="web3-gradient-text">WAGA</span>{" "}
            <span className="text-white">Coffee Platform</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed mb-6">
            Tokenize coffee batches, verify with Chainlink Functions, and manage redemptions ☕
          </p>
          
          {/* Dashboard Selection */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => window.location.href = '/dashboard/user'}
              className="web3-gradient-button-secondary px-8 py-4 text-center"
            >
              <div className="text-lg font-semibold">👤 Consumer Dashboard</div>
              <div className="text-xs opacity-75 mt-1">Manage tokens & deliveries</div>
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className="web3-gradient-button px-8 py-4 text-center"
            >
              <div className="text-lg font-semibold">🏭 Producer Dashboard</div>
              <div className="text-xs opacity-75 mt-1">Create & verify batches</div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex justify-center">
            <div className="web3-card p-2 flex space-x-2 rounded-2xl">
              <button
                onClick={() => setActiveTab('batches')}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'batches'
                    ? 'web3-gradient-button text-white'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                🌱 Verify Coffee Batches
              </button>
              <button
                onClick={() => setActiveTab('redemptions')}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'redemptions'
                    ? 'web3-gradient-button text-white'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                🪙 My Tokens & Redemptions
              </button>
            </div>
          </nav>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-pink-200/20 border-t-pink-500 rounded-full animate-spin absolute top-0 left-0" style={{animationDelay: '0.5s'}}></div>
            </div>
            <p className="text-purple-300 mt-4 font-medium">Loading Ethiopian coffee data...</p>
          </div>
        ) : (
          <>
            {/* Batches Tab */}
            {activeTab === 'batches' && (
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

            {/* Redemptions Tab */}
            {activeTab === 'redemptions' && (
              <div className="space-y-8">
                <TokenBalanceCard 
                  balances={userBalances} 
                  onRefresh={fetchUserBalances}
                />
                
                <div className="max-w-4xl mx-auto">
                  <RedemptionForm 
                    userBalances={userBalances}
                    onRedemptionCreated={handleRedemptionCreated}
                    userAddress={userAddress}
                  />
                </div>

                <RedemptionDashboard 
                  redemptions={redemptions}
                  onRefresh={fetchRedemptions}
                  userAddress={userAddress}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
