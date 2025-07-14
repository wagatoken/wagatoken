"use client";

import { UserTokenBalance } from "@/utils/types";

interface BatchTokenCardProps {
  balance: UserTokenBalance;
  onQuickRedeem: (batchId: number) => void;
}

export default function BatchTokenCard({ balance, onQuickRedeem }: BatchTokenCardProps) {
  const totalValue = balance.balance * balance.batchDetails.pricePerUnit;

  return (
    <div className="web3-card-dark hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Batch #{balance.batchId}
          </h3>
          <div className="text-purple-300 text-sm">
            {balance.batchDetails.farmName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold web3-gradient-text">
            {balance.balance}
          </div>
          <div className="text-xs text-gray-400">bags owned</div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Location:</span>
          <span className="text-white">{balance.batchDetails.location}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Packaging:</span>
          <span className="text-purple-300">{balance.batchDetails.packaging}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price per bag:</span>
          <span className="text-emerald-300">${balance.batchDetails.pricePerUnit}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-300">Total Value:</span>
          <span className="text-yellow-300">${totalValue}</span>
        </div>
      </div>

      <div className="border-t border-purple-500/20 pt-4">
        <button
          onClick={() => onQuickRedeem(balance.batchId)}
          className="w-full web3-gradient-button-secondary text-sm py-2"
        >
          🚚 Request Delivery
        </button>
      </div>
    </div>
  );
}
