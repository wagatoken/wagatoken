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
    harvestDate: '',
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
          harvestDate: formData.harvestDate,
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
          harvestDate: '',
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Coffee Batch</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch ID
          </label>
          <input
            type="number"
            name="batchId"
            value={formData.batchId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 1001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity (number of bags)
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per bag (USD)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Packaging Size
          </label>
          <select
            name="packaging"
            value={formData.packaging}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="250g">250g roasted coffee bags</option>
            <option value="500g">500g roasted coffee bags</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farm Name
          </label>
          <input
            type="text"
            name="farmName"
            value={formData.farmName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Highland Coffee Farm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Kigali, Rwanda"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harvest Date
          </label>
          <input
            type="date"
            name="harvestDate"
            value={formData.harvestDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
          >
            {submitting ? 'Creating Batch...' : 'Create Coffee Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}
