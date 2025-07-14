"use client";

import { useState } from "react";
import { UserTokenBalance } from "@/utils/types";

interface QuickRedemptionFormProps {
  userBalances: UserTokenBalance[];
  onRedemptionCreated: (redemption: any) => void;
  userAddress: string;
}

export default function QuickRedemptionForm({ userBalances, onRedemptionCreated, userAddress }: QuickRedemptionFormProps) {
  const selectedBalance = userBalances[0]; // Pre-selected batch
  const [formData, setFormData] = useState({
    quantity: 1,
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryCountry: 'USA',
    specialInstructions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fullDeliveryAddress = `${formData.deliveryAddress}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}, ${formData.deliveryCountry}`;
      
      const response = await fetch('/api/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBalance.batchId,
          quantity: formData.quantity,
          deliveryAddress: fullDeliveryAddress,
          userAddress
        })
      });

      if (response.ok) {
        const result = await response.json();
        onRedemptionCreated(result.redemption);
        
        // Show success message with navigation option
        alert(`Redemption request created successfully! You can track it in the "My Redemptions" tab.`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create redemption');
      }
    } catch (error) {
      console.error('Error creating redemption:', error);
      alert(error instanceof Error ? error.message : 'Failed to create redemption');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  if (!selectedBalance) {
    return <div className="text-red-400">No batch selected</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Batch Info */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl border border-purple-400/20">
        <h4 className="font-semibold text-white mb-2">Selected Batch</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Farm:</span>
            <div className="text-white">{selectedBalance.batchDetails.farmName}</div>
          </div>
          <div>
            <span className="text-gray-400">Available:</span>
            <div className="text-purple-300">{selectedBalance.balance} bags</div>
          </div>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold text-purple-300 mb-2">
          📦 Quantity (bags to deliver)
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min={1}
          max={selectedBalance.balance}
          required
          className="w-full web3-input"
        />
      </div>

      {/* Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            🏠 Street Address
          </label>
          <input
            type="text"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            required
            placeholder="123 Main St, Apt 4B"
            className="w-full web3-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">City</label>
          <input
            type="text"
            name="deliveryCity"
            value={formData.deliveryCity}
            onChange={handleChange}
            required
            className="w-full web3-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">State</label>
          <input
            type="text"
            name="deliveryState"
            value={formData.deliveryState}
            onChange={handleChange}
            required
            className="w-full web3-input"
          />
        </div>
      </div>

      {/* Special Instructions */}
      <div>
        <label className="block text-sm font-semibold text-purple-300 mb-2">
          📝 Special Instructions (Optional)
        </label>
        <textarea
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleChange}
          rows={3}
          placeholder="Leave at front door, call when delivered, etc."
          className="w-full web3-textarea"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full ${submitting ? 'opacity-50 cursor-not-allowed' : 'web3-gradient-button-secondary'} text-lg py-3`}
      >
        {submitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
            Creating Delivery Request...
          </div>
        ) : (
          '🚚 Request Coffee Delivery'
        )}
      </button>
    </form>
  );
}
