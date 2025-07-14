"use client";

import { RedemptionRequest } from "@/utils/types";

interface RedemptionDashboardProps {
  redemptions: RedemptionRequest[];
  onRefresh: () => void;
  userAddress: string;
}

export default function RedemptionDashboard({ redemptions, onRefresh, userAddress }: RedemptionDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Fulfilled': return '📦';
      case 'Processing': return '🔄';
      case 'Requested': return '📝';
      case 'Cancelled': return '❌';
      default: return '⚪';
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">My Coffee Redemptions</h2>
          <button
            onClick={onRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Track your coffee delivery requests and their status
        </p>
      </div>

      {redemptions.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          <div className="text-4xl mb-4">☕</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Redemptions Yet</h3>
          <p>You haven't requested any coffee deliveries. Create your first redemption request above!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {redemptions.map((redemption) => (
            <div key={redemption.redemptionId} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getStatusIcon(redemption.status)}</span>
                    <h3 className="text-lg font-medium text-gray-900">
                      Redemption #{redemption.redemptionId}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(redemption.status)}`}>
                      {redemption.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Batch ID:</span>
                      <div className="text-sm text-gray-900">#{redemption.batchId}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Quantity:</span>
                      <div className="text-sm text-gray-900">{redemption.quantity} bags</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Packaging:</span>
                      <div className="text-sm text-gray-900">{redemption.packagingInfo || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-500">Delivery Address:</span>
                    <div className="text-sm text-gray-900">{redemption.deliveryAddress}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Requested:</span> {formatDate(redemption.requestDate)}
                    </div>
                    {redemption.fulfillmentDate && (
                      <div>
                        <span className="font-medium">Fulfilled:</span> {formatDate(redemption.fulfillmentDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  {redemption.status === 'Fulfilled' && (
                    <div className="text-green-600 text-xs font-medium">
                      ✅ Delivered
                    </div>
                  )}
                  {redemption.status === 'Processing' && (
                    <div className="text-blue-600 text-xs font-medium">
                      🚚 In Transit
                    </div>
                  )}
                  {redemption.status === 'Requested' && (
                    <div className="text-yellow-600 text-xs font-medium">
                      ⏳ Pending
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
