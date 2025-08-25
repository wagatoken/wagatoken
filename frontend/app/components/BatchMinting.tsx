"use client";

import { useState, useEffect } from "react";
import { getBatchInfo, BatchInfo } from "@/utils/smartContracts";
import { MdCheck, MdAnalytics, MdInventory } from 'react-icons/md';

// NOTE: This component shows the deprecated minting interface
// In the new blockchain-first architecture, tokens are created automatically with batches

interface BatchMintingProps {
  batchId: number;
  userAddress: string;
  onMintComplete?: (success: boolean, txHash?: string) => void;
}

export default function BatchMinting({ batchId }: BatchMintingProps) {
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatchInfo();
  }, [batchId]);

  const loadBatchInfo = async () => {
    try {
      setLoading(true);
      const info = await getBatchInfo(batchId.toString());
      setBatchInfo(info);
    } catch (error) {
      console.error('Error loading batch info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="web3-card">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold web3-gradient-text mb-2 flex items-center justify-center">
          <MdInventory size={28} className="mr-2" />
          Token Status
        </h3>
        <p className="text-gray-400">Batch #{batchId}</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MdAnalytics className="text-blue-400" />
              <h4 className="text-blue-400 font-semibold">Blockchain-First Architecture</h4>
            </div>
            <p className="text-gray-300 text-sm">
              Tokens are created automatically when batches are created. No separate minting required.
            </p>
          </div>

          {batchInfo && (
            <div className="web3-card-section">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <MdInventory className="mr-2 text-blue-400" />
                Batch Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Batch ID:</span>
                  <span className="text-blue-300">{batchInfo.batchId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="text-blue-300">{batchInfo.quantity} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="text-blue-300">{batchInfo.pricePerUnit} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={batchInfo.isVerified ? 'text-green-300' : 'text-yellow-300'}>
                    {batchInfo.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MdCheck className="text-green-400" />
                  <span className="text-green-400 text-sm font-semibold">Tokens Ready</span>
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {batchInfo.quantity} tokens created and available for distribution.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { MdCheck, MdClose, MdWarning, MdAnalytics, MdInventory, MdAccessTime } from 'react-icons/md';
import { FaEthereum } from 'react-icons/fa';

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
      const roles = await getUserRoles(userAddress);
      setHasMinterRole(roles.isAdmin); // In new system, only admin can perform admin functions
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadBatchInfo = async () => {
    try {
      const info = await getBatchInfo(batchId.toString());
      setBatchInfo(info);
      
      // In new system, tokens are pre-created with batch, set default to current available quantity
      const remainingQuantity = info.quantity;
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
    setProgress('Preparing to mint tokens...');

    try {
      await contractService.initialize();
      
      setProgress('Submitting minting transaction...');
      const result = await contractService.mintTokens(
        userAddress,
        batchId,
        mintQuantity
      );

      setTxHash(result.txHash);
      setProgress('Waiting for transaction confirmation...');
      
      setProgress('Tokens minted successfully!');
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
        <h3 className="text-2xl font-bold web3-gradient-text mb-2 flex items-center justify-center">
          <TokenETH className="mr-2" />
          Token Minting
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
          <p className="text-yellow-400 text-sm flex items-center">
            <MdWarning className="mr-2" />
            You need MINTER role to mint tokens. Please contact an admin.
          </p>
        </div>
      )}

      {batchInfo && !batchInfo.isVerified && (
        <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg">
          <p className="text-orange-400 text-sm flex items-center">
            <MdWarning className="mr-2" />
            Batch must be verified before tokens can be minted.
          </p>
        </div>
      )}

      {isFullyMinted && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400 text-sm flex items-center">
            <MdCheck className="mr-2" />
            This batch is fully minted! All expected tokens have been created.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Batch Status Section */}
        {batchInfo && (
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <MdAnalytics className="mr-2" />
              Batch Status
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Batch ID:</span>
                <span className="text-purple-300">#{batchId}</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Status:</span>
                <span className={`flex items-center ${batchInfo.isVerified ? 'text-green-300' : 'text-red-300'}`}>
                  {batchInfo.isVerified ? (
                    <>
                      <MdCheck className="mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <MdClose className="mr-1" />
                      Not Verified
                    </>
                  )}
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
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <TokenETH className="mr-2" />
              Mint Configuration
            </h4>
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
            <span className="flex items-center justify-center">
              <MdCheck className="mr-2" />
              Fully Minted
            </span>
          ) : !batchInfo?.isVerified ? (
            <span className="flex items-center justify-center">
              <MdWarning className="mr-2" />
              Verification Required
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <TokenETH className="mr-2" />
              Mint {mintQuantity} Tokens
            </span>
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
