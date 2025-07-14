"use client";

import { UserTokenBalance } from "@/utils/types";

interface TokenBalanceCardProps {
  balances: UserTokenBalance[];
  onRefresh: () => void;
}

export default function TokenBalanceCard({ balances, onRefresh }: TokenBalanceCardProps) {
  const totalTokens = balances.reduce((sum, balance) => sum + balance.balance, 0);
  const totalValue = balances.reduce((sum, balance) => sum + (balance.balance * balance.batchDetails.pricePerUnit), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Coffee Tokens</h2>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {balances.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🪙</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Coffee Tokens</h3>
          <p className="text-gray-600">You don't have any coffee tokens yet. Purchase from verified batches to start redeeming coffee!</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalTokens}</div>
              <div className="text-sm text-gray-600">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{balances.length}</div>
              <div className="text-sm text-gray-600">Batches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${totalValue}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-3">
            {balances.map((balance) => (
              <div key={balance.batchId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">Batch #{balance.batchId}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {balance.balance} tokens
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Farm:</span> {balance.batchDetails.farmName}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {balance.batchDetails.location}
                      </div>
                      <div>
                        <span className="font-medium">Packaging:</span> {balance.batchDetails.packaging}
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> ${balance.balance * balance.batchDetails.pricePerUnit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{balance.balance}</div>
                    <div className="text-sm text-gray-500">bags available</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
