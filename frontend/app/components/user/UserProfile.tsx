"use client";

import { useState } from "react";

interface UserProfileProps {
  userAddress: string;
}

export default function UserProfile({ userAddress }: UserProfileProps) {
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      label: "Home",
      address: "123 Main St, Apt 4B, Seattle, WA 98101, USA",
      isDefault: true
    },
    {
      id: 2,
      label: "Office",
      address: "456 Business Ave, Suite 200, Seattle, WA 98102, USA",
      isDefault: false
    }
  ]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    deliveryInstructions: "Leave at front door",
    preferredDeliveryTime: "morning"
  });

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/user?tab=portfolio'}
            className="p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-400/30 hover:from-purple-500/30 hover:to-indigo-500/30 transition-all"
          >
            <div className="text-2xl mb-2">🪙</div>
            <div className="font-semibold text-white">View Portfolio</div>
            <div className="text-sm text-gray-400">Check token balances</div>
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard/user?tab=redemptions'}
            className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/30 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="font-semibold text-white">Track Deliveries</div>
            <div className="text-sm text-gray-400">Monitor shipments</div>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
          >
            <div className="text-2xl mb-2">🌱</div>
            <div className="font-semibold text-white">Browse Batches</div>
            <div className="text-sm text-gray-400">Find new coffee</div>
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Wallet Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Connected Wallet Address
            </label>
            <div className="web3-input bg-gray-700/50 font-mono text-sm">
              {userAddress}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <p>Your coffee tokens and redemption history are tied to this wallet address.</p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Delivery Addresses</h2>
        <div className="space-y-4">
          {savedAddresses.map((addr) => (
            <div key={addr.id} className="p-4 bg-gray-800/50 rounded-xl border border-purple-500/20">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white">{addr.label}</h3>
                  {addr.isDefault && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <button className="text-purple-300 hover:text-white text-sm">Edit</button>
              </div>
              <p className="text-gray-300 text-sm">{addr.address}</p>
            </div>
          ))}
          
          <button className="w-full p-4 border-2 border-dashed border-purple-500/30 rounded-xl text-purple-300 hover:border-purple-500/50 hover:text-white transition-colors">
            + Add New Address
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="web3-card">
        <h2 className="text-2xl font-bold web3-gradient-text mb-6">Delivery Preferences</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Default Delivery Instructions
            </label>
            <textarea
              value={preferences.deliveryInstructions}
              onChange={(e) => setPreferences(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
              className="w-full web3-textarea"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Preferred Delivery Time
            </label>
            <select
              value={preferences.preferredDeliveryTime}
              onChange={(e) => setPreferences(prev => ({ ...prev, preferredDeliveryTime: e.target.value }))}
              className="w-full web3-select"
            >
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 8 PM)</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-300">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-purple-500 rounded focus:ring-purple-500"
                />
                <span className="text-white">Email notifications for delivery updates</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-purple-500 rounded focus:ring-purple-500"
                />
                <span className="text-white">SMS notifications for delivery updates</span>
              </label>
            </div>
          </div>

          <button className="web3-gradient-button w-full">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
