"use client";

import { useState } from "react";
import { CoffeeBatch } from "@/utils/types";

interface BatchFormProps {
  onBatchCreated: (batch: CoffeeBatch) => void;
}

export default function BatchForm({ onBatchCreated }: BatchFormProps) {
  const [formData, setFormData] = useState({
    batchId: '',
    quantity: '',
    price: '',
    packaging: '250g',
    farmName: '',
    location: '',
    productionDate: '',
    expiryDate: '',
    processingMethod: 'washed',
    qualityScore: '85'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Generate metadata hash (in production, this would be a proper hash)
      const metadataHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const batchData: Omit<CoffeeBatch, 'createdAt' | 'updatedAt'> = {
        batchId: parseInt(formData.batchId),
        quantity: parseInt(formData.quantity),
        price: parseInt(formData.price),
        packaging: formData.packaging,
        metadataHash,
        verification: {
          lastVerified: new Date().toISOString(),
          verificationStatus: 'pending',
          inventoryActual: parseInt(formData.quantity)
        },
        batchDetails: {
          farmName: formData.farmName,
          location: formData.location,
          productionDate: formData.productionDate,  // Now consistent
          expiryDate: formData.expiryDate,
          processingMethod: formData.processingMethod,
          qualityScore: parseInt(formData.qualityScore)
        }
      };

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (response.ok) {
        const result = await response.json();
        onBatchCreated(result.batch);
        
        // Reset form
        setFormData({
          batchId: '',
          quantity: '',
          price: '',
          packaging: '250g',
          farmName: '',
          location: '',
          productionDate: '',
          expiryDate: '',
          processingMethod: 'washed',
          qualityScore: '85'
        });
      } else {
        throw new Error('Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="web3-card">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold web3-gradient-text mb-2">Create New Coffee Batch</h3>
        <p className="text-gray-400">Add a new batch of premium Ethiopian roasted coffee to the blockchain</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            🆔 Batch ID
          </label>
          <input
            type="number"
            name="batchId"
            value={formData.batchId}
            onChange={handleChange}
            required
            className="w-full web3-input"
            placeholder="e.g. 1001"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            📦 Quantity (number of bags)
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full web3-input"
            placeholder="e.g. 100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            💰 Price per bag (USD)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full web3-input"
            placeholder="e.g. 25"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            📏 Packaging Size
          </label>
          <select
            name="packaging"
            value={formData.packaging}
            onChange={handleChange}
            className="w-full web3-select"
          >
            <option value="250g">250g roasted coffee bags</option>
            <option value="500g">500g roasted coffee bags</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            🏔️ Farm Name
          </label>
          <input
            type="text"
            name="farmName"
            value={formData.farmName}
            onChange={handleChange}
            required
            className="w-full web3-input"
            placeholder="e.g. Yirgacheffe Highlands Farm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            📍 Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full web3-input"
            placeholder="e.g. Sidama, Ethiopia"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            🏭 Production Date
          </label>
          <input
            type="date"
            name="productionDate"
            value={formData.productionDate}
            onChange={handleChange}
            required
            className="w-full web3-input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-purple-300 mb-2">
            ⏳ Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="w-full web3-input"
          />
        </div>

        <div className="md:col-span-2 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full ${submitting ? 'opacity-50 cursor-not-allowed' : 'web3-gradient-button'} text-lg py-4`}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                Creating Ethiopian Coffee Batch...
              </div>
            ) : (
              '🚀 Create New Coffee Batch'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
