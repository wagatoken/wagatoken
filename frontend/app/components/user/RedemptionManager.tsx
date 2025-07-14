"use client";

import { RedemptionRequest } from "@/utils/types";
import DeliveryTracker from "./DeliveryTracker";

interface RedemptionManagerProps {
  redemptions: RedemptionRequest[];
  onRefresh: () => void;
  userAddress: string;
}

export default function RedemptionManager({ redemptions, onRefresh, userAddress }: RedemptionManagerProps) {
  const activeRedemptions = redemptions.filter(r => ['Requested', 'Processing'].includes(r.status));
  const completedRedemptions = redemptions.filter(r => ['Fulfilled', 'Cancelled'].includes(r.status));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'Processing': return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      case 'Requested': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 'Cancelled': return 'from-red-500/20 to-pink-500/20 border-red-400/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Active Redemptions */}
      <div className="web3-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold web3-gradient-text">Active Deliveries</h2>
          <button onClick={onRefresh} className="text-purple-300 hover:text-white transition-colors">
            🔄 Refresh
          </button>
        </div>

        {activeRedemptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-white mb-2">No Active Deliveries</h3>
            <p className="text-gray-400 mb-4">Your delivery requests will appear here once you place an order.</p>
            <button
              onClick={() => window.location.href = '/dashboard/user?tab=portfolio'}
              className="web3-gradient-button-secondary"
            >
              🪙 View My Tokens
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeRedemptions.map((redemption) => (
              <DeliveryTracker key={redemption.redemptionId} redemption={redemption} />
            ))}
          </div>
        )}
      </div>

      {/* Delivery History */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Delivery History</h2>

        {completedRedemptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-white mb-2">No Past Deliveries</h3>
            <p className="text-gray-400 mb-4">Your completed deliveries will appear here.</p>
            <button
              onClick={() => window.location.href = '/dashboard/user?tab=portfolio'}
              className="web3-gradient-button-secondary"
            >
              🚚 Request First Delivery
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {completedRedemptions.map((redemption) => (
              <div 
                key={redemption.redemptionId}
                className={`p-6 bg-gradient-to-r ${getStatusColor(redemption.status)} rounded-xl border`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Redemption #{redemption.redemptionId}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Batch:</span>
                        <div className="text-white">#{redemption.batchId}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Quantity:</span>
                        <div className="text-white">{redemption.quantity} bags</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested:</span>
                        <div className="text-white">{formatDate(redemption.requestDate)}</div>
                      </div>
                      {redemption.fulfillmentDate && (
                        <div>
                          <span className="text-gray-400">Delivered:</span>
                          <div className="text-white">{formatDate(redemption.fulfillmentDate)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      redemption.status === 'Fulfilled' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {redemption.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
