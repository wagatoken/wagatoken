"use client";

import { useState, useEffect } from "react";
import { contractService, BatchInfo } from "@/app/services/contractService";

interface BatchMintingProps {
  batchId: number;
  userAddress: string;
  onMintComplete?: (success: boolean, txHash?: string) => void;
}

export default function BatchMinting({ 
  batchId, 
  userAddress, 
  onMintComplete 
}: BatchMintingProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintQuantity, setMintQuantity] = useState<number>(0);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [hasMinterRole, setHasMinterRole] = useState(false);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    checkUserRole();
    loadBatchInfo();
  }, [userAddress, batchId]);

  const checkUserRole = async () => {
    try {
      await contractService.initialize();
      const hasRole = await contractService.hasRole('MINTER', userAddress);
      setHasMinterRole(hasRole);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadBatchInfo = async () => {
    try {
      await contractService.initialize();
      const info = await contractService.getBatchInfo(batchId);
      setBatchInfo(info);
      
      // Set default mint quantity to remaining quantity (expectedQuantity - currentQuantity)
      const remainingQuantity = info.expectedQuantity - info.currentQuantity;
      setMintQuantity(remainingQuantity > 0 ? remainingQuantity : 0);
    } catch (error) {
      console.error('Error loading batch info:', error);
      setError('Failed to load batch information');
    }
  };

  const startMinting = async () => {
    if (!hasMinterRole) {
      setError('You need MINTER role to mint tokens');
      return;
    }

    if (!batchInfo) {
      setError('Batch information not loaded');
      return;
    }

    if (!batchInfo.isVerified) {
      setError('Batch must be verified before minting tokens');
      return;
    }

    if (mintQuantity <= 0) {
      setError('Mint quantity must be greater than 0');
      return;
    }

    const maxMintable = batchInfo.expectedQuantity - batchInfo.currentQuantity;
    if (mintQuantity > maxMintable) {
      setError(`Cannot mint more than ${maxMintable} tokens (remaining quantity)`);
      return;
    }

    setIsMinting(true);
    setError('');
    setProgress('🪙 Preparing to mint tokens...');

    try {
      await contractService.initialize();
      
      setProgress('📝 Submitting minting transaction...');
      const result = await contractService.mintTokens(
        userAddress,
        batchId,
        mintQuantity
      );

      setTxHash(result.txHash);
      setProgress('⏳ Waiting for transaction confirmation...');
      
      setProgress('✅ Tokens minted successfully!');
      setIsMinting(false);
      
      // Reload batch info to show updated quantities
      await loadBatchInfo();
      
      onMintComplete?.(true, result.txHash);
      
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      setError(`Failed to mint tokens: ${error.message}`);
      setIsMinting(false);
      setProgress('');
      onMintComplete?.(false);
    }
  };

  const availableToMint = batchInfo 
    ? batchInfo.expectedQuantity - batchInfo.currentQuantity 
    : 0;

  const isFullyMinted = batchInfo 
    ? batchInfo.currentQuantity >= batchInfo.expectedQuantity 
    : false;

  return (
    <div className="web3-card">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold web3-gradient-text mb-2">
          🪙 Token Minting
        </h3>
        <p className="text-gray-400">
          Mint ERC-1155 coffee tokens for batch #{batchId}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!hasMinterRole && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ You need MINTER role to mint tokens. Please contact an admin.
          </p>
        </div>
      )}

      {batchInfo && !batchInfo.isVerified && (
        <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <p className="text-orange-400 text-sm">
            ⚠️ Batch must be verified before tokens can be minted.
          </p>
        </div>
      )}

      {isFullyMinted && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ This batch is fully minted! All expected tokens have been created.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Batch Status Section */}
        {batchInfo && (
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3">📊 Batch Status</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Batch ID:</span>
                <span className="text-purple-300">#{batchId}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Status:</span>
                <span className={batchInfo.isVerified ? 'text-green-300' : 'text-red-300'}>
                  {batchInfo.isVerified ? '✅ Verified' : '❌ Not Verified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expected Quantity:</span>
                <span className="text-blue-300">{batchInfo.expectedQuantity} bags</span>
              </div>
              <div className="flex justify-between">
                <span>Currently Minted:</span>
                <span className="text-blue-300">{batchInfo.currentQuantity} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Available to Mint:</span>
                <span className={availableToMint > 0 ? 'text-green-300' : 'text-gray-400'}>
                  {availableToMint} tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price per Token:</span>
                <span className="text-green-300">{batchInfo.pricePerUnit} ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Minting Form */}
        {batchInfo && batchInfo.isVerified && !isFullyMinted && hasMinterRole && (
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3">🪙 Mint Configuration</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mint Quantity
                </label>
                <input
                  type="number"
                  value={mintQuantity}
                  onChange={(e) => setMintQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  max={availableToMint}
                  min={1}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter quantity to mint..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum: {availableToMint} tokens
                </p>
              </div>
              
              <div className="flex justify-between text-sm text-gray-300">
                <span>Total Value:</span>
                <span className="text-green-300">
                  {(mintQuantity * parseFloat(batchInfo.pricePerUnit)).toFixed(4)} ETH
                </span>
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
          onClick={startMinting}
          disabled={
            isMinting || 
            !hasMinterRole || 
            !batchInfo?.isVerified || 
            isFullyMinted || 
            mintQuantity <= 0 ||
            mintQuantity > availableToMint
          }
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            isMinting || 
            !hasMinterRole || 
            !batchInfo?.isVerified || 
            isFullyMinted || 
            mintQuantity <= 0 ||
            mintQuantity > availableToMint
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'web3-gradient-button'
          }`}
        >
          {isMinting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Minting...
            </div>
          ) : isFullyMinted ? (
            '✅ Fully Minted'
          ) : !batchInfo?.isVerified ? (
            '⚠️ Verification Required'
          ) : (
            `🪙 Mint ${mintQuantity} Tokens`
          )}
        </button>

        {/* Info Section */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Minting Process:</h4>
          <ol className="text-xs text-gray-400 space-y-1">
            <li>1. Batch must be verified by Chainlink Functions</li>
            <li>2. Enter quantity to mint (up to remaining capacity)</li>
            <li>3. Submit transaction to create ERC-1155 tokens</li>
            <li>4. Tokens are minted to your address</li>
            <li>5. Tokens can be traded or redeemed for physical coffee</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
