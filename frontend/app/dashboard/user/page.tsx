"use client";

import { useState, useEffect } from "react";
import { RedemptionRequest, UserTokenBalance } from "@/utils/types";
import TokenPortfolio from "../../components/user/TokenPortfolio";
import RedemptionManager from "../../components/user/RedemptionManager";
import UserProfile from "../../components/user/UserProfile";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'redemptions' | 'profile'>('portfolio');
  const [userBalances, setUserBalances] = useState<UserTokenBalance[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock user address - in production this would come from wallet connection
  const userAddress = "0x742d35Cc6634C0532925a3b8D581C2532D8b8132";

  const fetchUserData = async () => {
    try {
      const [balancesResponse, redemptionsResponse] = await Promise.all([
        fetch(`/api/user/tokens?userAddress=${userAddress}`),
        fetch(`/api/redemptions?userAddress=${userAddress}`)
      ]);

      if (balancesResponse.ok) {
        const balancesData = await balancesResponse.json();
        setUserBalances(balancesData.balances || []);
      }

      if (redemptionsResponse.ok) {
        const redemptionsData = await redemptionsResponse.json();
        setRedemptions(redemptionsData.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleRedemptionCreated = (newRedemption: RedemptionRequest) => {
    setRedemptions(prev => [newRedemption, ...prev]);
    fetchUserData(); // Refresh balances as they may have changed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-pink-200/20 border-t-pink-500 rounded-full animate-spin absolute top-0 left-0" style={{animationDelay: '0.5s'}}></div>
          </div>
          <p className="text-purple-300 mt-4 font-medium">Loading your coffee portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors"
            >
              <span className="text-lg">←</span>
              <span>Back to Main Platform</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
              >
                🏠 Home
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30"
              >
                🏭 Producer Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold web3-gradient-text mb-2">
                My Coffee Portfolio
              </h1>
              <p className="text-gray-300">
                Manage your coffee tokens and track deliveries
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-300">Connected Wallet</div>
              <div className="font-mono text-xs text-gray-400">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex justify-center">
            <div className="web3-card p-2 flex space-x-2 rounded-2xl">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'portfolio'
                    ? 'web3-gradient-button text-white'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                🪙 Token Portfolio
              </button>
              <button
                onClick={() => setActiveTab('redemptions')}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'redemptions'
                    ? 'web3-gradient-button text-white'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                📦 My Redemptions
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'profile'
                    ? 'web3-gradient-button text-white'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                👤 Profile
              </button>
            </div>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <TokenPortfolio 
            balances={userBalances}
            onRefresh={fetchUserData}
            onRedemptionCreated={handleRedemptionCreated}
            userAddress={userAddress}
          />
        )}

        {activeTab === 'redemptions' && (
          <RedemptionManager 
            redemptions={redemptions}
            onRefresh={fetchUserData}
            userAddress={userAddress}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile userAddress={userAddress} />
        )}
      </div>
    </main>
  );
}
