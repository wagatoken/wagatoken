"use client";

import { useState } from "react";
import { UserTokenBalance, RedemptionRequest } from "@/utils/types";
import BatchTokenCard from "./BatchTokenCard";
import QuickRedemptionForm from "./QuickRedemptionForm";

interface TokenPortfolioProps {
  balances: UserTokenBalance[];
  onRefresh: () => void;
  onRedemptionCreated: (redemption: RedemptionRequest) => void;
  userAddress: string;
}

export default function TokenPortfolio({ balances, onRefresh, onRedemptionCreated, userAddress }: TokenPortfolioProps) {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [showRedemptionForm, setShowRedemptionForm] = useState(false);

  const totalTokens = balances.reduce((sum, balance) => sum + balance.balance, 0);
  const totalValue = balances.reduce((sum, balance) => sum + (balance.balance * balance.batchDetails.pricePerUnit), 0);

  const handleQuickRedeem = (batchId: number) => {
    setSelectedBatch(batchId);
    setShowRedemptionForm(true);
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Overview */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Portfolio Overview</h2>
        
        {balances.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-bold text-white mb-3">No Coffee Tokens Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              You don't have any coffee tokens yet. Visit the producer dashboard to purchase from verified batches!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="web3-gradient-button"
              >
                🌱 Browse Coffee Batches
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/user?tab=profile'}
                className="web3-gradient-button-secondary"
              >
                ⚙️ Setup Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-400/30">
                <div className="text-3xl font-bold web3-gradient-text">{totalTokens}</div>
                <div className="text-purple-300 text-sm mt-1">Total Coffee Bags</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/30">
                <div className="text-3xl font-bold text-emerald-300">{balances.length}</div>
                <div className="text-emerald-300 text-sm mt-1">Different Farms</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
                <div className="text-3xl font-bold text-yellow-300">${totalValue}</div>
                <div className="text-yellow-300 text-sm mt-1">Portfolio Value</div>
              </div>
            </div>

            {/* Token Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {balances.map((balance) => (
                <BatchTokenCard
                  key={balance.batchId}
                  balance={balance}
                  onQuickRedeem={handleQuickRedeem}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick Redemption Form */}
      {showRedemptionForm && selectedBatch && (
        <div className="web3-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold web3-gradient-text">Quick Redemption</h3>
            <button
              onClick={() => {
                setShowRedemptionForm(false);
                setSelectedBatch(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <QuickRedemptionForm
            userBalances={balances.filter(b => b.batchId === selectedBatch)}
            onRedemptionCreated={(redemption) => {
              onRedemptionCreated(redemption);
              setShowRedemptionForm(false);
              setSelectedBatch(null);
            }}
            userAddress={userAddress}
          />
        </div>
      )}
    </div>
  );
}
