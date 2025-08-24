"use client";

import { useState, useEffect } from "react";
import { contractService, BatchInfo } from "@/app/services/contractService";
import { CoffeeBeanIcon } from "./icons/WagaIcons";
import { MdAnalytics, MdWarning, MdBlock } from 'react-icons/md';

interface BatchRedemptionProps {
  batchId: number;
  userAddress: string;
  onRedemptionComplete?: (success: boolean, txHash?: string) => void;
}

export default function BatchRedemption({ 
  batchId, 
  userAddress, 
  onRedemptionComplete 
}: BatchRedemptionProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionQuantity, setRedemptionQuantity] = useState<number>(1);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    loadBatchInfo();
    loadUserBalance();
  }, [userAddress, batchId]);

  const loadBatchInfo = async () => {
    try {
      await contractService.initialize();
      const info = await contractService.getBatchInfo(batchId);
      setBatchInfo(info);
    } catch (error) {
      console.error('Error loading batch info:', error);
      setError('Failed to load batch information');
    }
  };

  const loadUserBalance = async () => {
    try {
      await contractService.initialize();
      const balance = await contractService.getTokenBalance(userAddress, batchId);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading user balance:', error);
    }
  };

  const startRedemption = async () => {
    if (!batchInfo) {
      setError('Batch information not loaded');
      return;
    }

    if (redemptionQuantity <= 0) {
      setError('Redemption quantity must be greater than 0');
      return;
    }

    if (redemptionQuantity > userBalance) {
      setError(`Cannot redeem more than ${userBalance} tokens (your balance)`);
      return;
    }

    if (!shippingAddress.trim()) {
      setError('Shipping address is required');
      return;
    }

    if (!contactInfo.trim()) {
      setError('Contact information is required');
      return;
    }

    setIsRedeeming(true);
    setError('');
    setProgress('Preparing redemption request...');

    try {
      await contractService.initialize();
      
      setProgress('Submitting redemption transaction...');
      
      // Combine shipping address and contact info
      const fullDeliveryAddress = `${shippingAddress}\n\nContact: ${contactInfo}`;
      
      const result = await contractService.requestRedemption(
        batchId,
        redemptionQuantity,
        fullDeliveryAddress
      );

      setTxHash(result.txHash);
      setProgress('Redemption request submitted successfully!');
      setIsRedeeming(false);
      
      // Reload user balance to show updated tokens
      await loadUserBalance();
      
      onRedemptionComplete?.(true, result.txHash);
      
    } catch (error: any) {
      console.error('Error requesting redemption:', error);
      setError(`Failed to request redemption: ${error.message}`);
      setIsRedeeming(false);
      setProgress('');
      onRedemptionComplete?.(false);
    }
  };

  const estimatedTotal = batchInfo 
    ? (redemptionQuantity * parseFloat(batchInfo.pricePerUnit)).toFixed(4)
    : '0';

  return (
    <div className="web3-card">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold web3-gradient-text mb-2 flex items-center justify-center">
          <CoffeeBeanIcon size={28} className="mr-2 waga-icon-coffee" />
          Coffee Redemption
        </h3>
        <p className="text-gray-400">
          Redeem your ERC-1155 tokens for physical coffee delivery
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {userBalance === 0 && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm flex items-center">
            <MdWarning className="mr-2" />
            You don't own any tokens for this batch. You need to mint or purchase tokens first.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Batch & User Info Section */}
        {batchInfo && (
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <MdAnalytics className="mr-2" />
              Batch & Token Info
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Batch ID:</span>
                <span className="text-purple-300">#{batchId}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Token Balance:</span>
                <span className={userBalance > 0 ? 'text-green-300' : 'text-gray-400'}>
                  {userBalance} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span>Packaging:</span>
                <span className="text-blue-300">{batchInfo.packagingInfo}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per Unit:</span>
                <span className="text-green-300">{batchInfo.pricePerUnit} ETH</span>
              </div>
              <div className="flex justify-between">
                <span>Production Date:</span>
                <span className="text-gray-300">
                  {new Date(batchInfo.productionDate * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expiry Date:</span>
                <span className="text-gray-300">
                  {new Date(batchInfo.expiryDate * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Redemption Form */}
        {userBalance > 0 && batchInfo && (
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <CoffeeBeanIcon size={20} className="mr-2 waga-icon-coffee" />
              Redemption Request
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Redemption Quantity
                </label>
                <input
                  type="number"
                  value={redemptionQuantity}
                  onChange={(e) => setRedemptionQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  max={userBalance}
                  min={1}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter quantity to redeem..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum: {userBalance} tokens
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shipping Address *
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your complete shipping address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Information *
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Email or phone number..."
                />
              </div>
              
              <div className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Redemption Quantity:</span>
                  <span className="text-blue-300">{redemptionQuantity} tokens</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Estimated Value:</span>
                  <span className="text-green-300">{estimatedTotal} ETH</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Tokens After Redemption:</span>
                  <span className="text-purple-300">{userBalance - redemptionQuantity} tokens</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {progress && (
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">{progress}</p>
            {txHash && (
              <p className="text-xs text-gray-400 mt-2">
                Transaction: {txHash.substring(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={startRedemption}
          disabled={
            isRedeeming || 
            userBalance === 0 || 
            redemptionQuantity <= 0 ||
            redemptionQuantity > userBalance ||
            !shippingAddress.trim() ||
            !contactInfo.trim()
          }
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            isRedeeming || 
            userBalance === 0 || 
            redemptionQuantity <= 0 ||
            redemptionQuantity > userBalance ||
            !shippingAddress.trim() ||
            !contactInfo.trim()
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'web3-gradient-button'
          }`}
        >
          {isRedeeming ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Processing Redemption...
            </div>
          ) : userBalance === 0 ? (
            <span className="flex items-center justify-center">
              <MdBlock className="mr-2" />
              No Tokens to Redeem
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <CoffeeBeanIcon size={20} className="mr-2 waga-icon-coffee" />
              Redeem {redemptionQuantity} Tokens
            </span>
          )}
        </button>

        {/* Info Section */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Redemption Process:</h4>
          <ol className="text-xs text-gray-400 space-y-1">
            <li>1. Select quantity of tokens to redeem</li>
            <li>2. Provide shipping address and contact info</li>
            <li>3. Submit redemption request on blockchain</li>
            <li>4. Tokens are burned from your balance</li>
            <li>5. WAGA team processes physical coffee delivery</li>
            <li>6. Track your order via provided contact information</li>
          </ol>
          
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              <strong>Note:</strong> Redemption is irreversible. Tokens will be permanently burned upon successful redemption request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
