"use client";

import { RedemptionRequest } from "@/utils/types";

interface DeliveryTrackerProps {
  redemption: RedemptionRequest;
}

export default function DeliveryTracker({ redemption }: DeliveryTrackerProps) {
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'Requested': return 25;
      case 'Processing': return 75;
      case 'Fulfilled': return 100;
      default: return 0;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'Requested', label: 'Order Received', icon: '📝', completed: true },
      { key: 'Processing', label: 'Preparing Shipment', icon: '📦', completed: status !== 'Requested' },
      { key: 'Shipped', label: 'In Transit', icon: '🚚', completed: false },
      { key: 'Fulfilled', label: 'Delivered', icon: '✅', completed: status === 'Fulfilled' }
    ];
    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const steps = getStatusSteps(redemption.status);
  const progress = getProgressPercentage(redemption.status);

  return (
    <div className="web3-card-dark">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            Delivery #{redemption.redemptionId}
          </h3>
          <p className="text-gray-400 text-sm">
            {redemption.quantity} bags from Batch #{redemption.batchId}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-purple-300">Current Status</div>
          <div className="font-semibold text-white">{redemption.status}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Order Progress</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Status Steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step.completed 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gray-600 text-gray-400'
            }`}>
              {step.icon}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                {step.label}
              </div>
              {step.completed && step.key === redemption.status && (
                <div className="text-xs text-purple-300">
                  {formatDate(redemption.requestDate)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <div className="border-t border-purple-500/20 pt-4">
        <div className="text-sm text-gray-400 mb-1">Delivery Address:</div>
        <div className="text-white">{redemption.deliveryAddress}</div>
      </div>
    </div>
  );
}
