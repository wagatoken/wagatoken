"use client";

import { useState } from "react";
import { UserTokenBalance, RedemptionFormData } from "@/utils/types";

interface RedemptionFormProps {
  userBalances: UserTokenBalance[];
  onRedemptionCreated: (redemption: any) => void;
  userAddress: string;
}

export default function RedemptionForm({ userBalances, onRedemptionCreated, userAddress }: RedemptionFormProps) {
  const [formData, setFormData] = useState<RedemptionFormData>({
    batchId: 0,
    quantity: 1,
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZip: '',
    deliveryCountry: 'USA',
    specialInstructions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedBalance = userBalances.find(b => b.batchId === formData.batchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fullDeliveryAddress = `${formData.deliveryAddress}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}, ${formData.deliveryCountry}`;
      
      const response = await fetch('/api/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deliveryAddress: fullDeliveryAddress,
          userAddress
        })
      });

      if (response.ok) {
        const result = await response.json();
        onRedemptionCreated(result.redemption);
        
        // Reset form
        setFormData({
          batchId: 0,
          quantity: 1,
          deliveryAddress: '',
          deliveryCity: '',
          deliveryState: '',
          deliveryZip: '',
          deliveryCountry: 'USA',
          specialInstructions: ''
        });
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
      [name]: name === 'batchId' || name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  if (userBalances.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No Tokens Available</h3>
        <p className="text-yellow-700">You don't have any coffee tokens to redeem. Purchase tokens from verified batches first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Request Coffee Delivery</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Coffee Batch
          </label>
          <select
            name="batchId"
            value={formData.batchId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Choose a batch...</option>
            {userBalances.map(balance => (
              <option key={balance.batchId} value={balance.batchId}>
                #{balance.batchId} - {balance.batchDetails.farmName} ({balance.balance} tokens available)
              </option>
            ))}
          </select>
        </div>

        {/* Batch Details */}
        {selectedBalance && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Farm:</strong> {selectedBalance.batchDetails.farmName}</div>
              <div><strong>Location:</strong> {selectedBalance.batchDetails.location}</div>
              <div><strong>Packaging:</strong> {selectedBalance.batchDetails.packaging}</div>
              <div><strong>Available:</strong> {selectedBalance.balance} bags</div>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (number of bags)
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min={1}
            max={selectedBalance?.balance || 1}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              required
              placeholder="123 Main St, Apt 4B"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="deliveryState"
              value={formData.deliveryState}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              name="deliveryZip"
              value={formData.deliveryZip}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              name="deliveryCountry"
              value={formData.deliveryCountry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USA">United States</option>
              <option value="CAN">Canada</option>
              <option value="MEX">Mexico</option>
            </select>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions (Optional)
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            rows={3}
            placeholder="Leave at front door, call when delivered, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !formData.batchId}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          {submitting ? 'Creating Redemption Request...' : 'Request Coffee Delivery'}
        </button>
      </form>
    </div>
  );
}
