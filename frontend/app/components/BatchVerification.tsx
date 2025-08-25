"use client";

import { useState, useEffect } from "react";
import { requestBatchVerification, getVerificationRequest, getUserRoles, VerificationRequest } from "@/utils/smartContracts";
import { MdCheck, MdClose, MdAccessTime, MdWarning, MdError } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa';

interface BatchVerificationProps {
  batchId: number;
  userAddress: string;
  onVerificationComplete?: (success: boolean) => void;
}

export default function BatchVerification({ 
  batchId, 
  userAddress, 
  onVerificationComplete 
}: BatchVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationRequest | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [hasVerifierRole, setHasVerifierRole] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, [userAddress]);

  useEffect(() => {
    if (requestId) {
      // Poll for verification completion
      const interval = setInterval(checkVerificationStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [requestId]);

  const checkUserRole = async () => {
    try {
      const roles = await getUserRoles(userAddress);
      setHasVerifierRole(roles.isVerifier);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const checkVerificationStatus = async () => {
    if (!requestId) return;

    try {
      const status = await getVerificationRequest(requestId);
      setVerificationStatus(status);

      if (status.completed) {
        setProgress(status.verified ? 'Verification completed successfully!' : 'Verification failed');
        setIsVerifying(false);
        onVerificationComplete?.(status.verified);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const startVerification = async () => {
    if (!hasVerifierRole) {
      setError('You need VERIFIER role to request batch verification');
      return;
    }

    setIsVerifying(true);
    setError('');
    setProgress('Requesting batch verification...');

    try {
      const requestId = await requestBatchVerification(
        batchId.toString(),
        userAddress
      );

      setRequestId(requestId);
      setProgress('Verification request submitted. Waiting for Chainlink response...');
      
    } catch (error: any) {
      console.error('Error starting verification:', error);
      setError(`Failed to start verification: ${error.message}`);
      setIsVerifying(false);
      setProgress('');
    }
  };

  return (
    <div className="web3-card">
      <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MdCheck size={20} />
          <span>Batch Verification</span>
        </h3>
        <p className="text-gray-400">
          Verify coffee batch #{batchId} using Chainlink Functions
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!hasVerifierRole && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <span className="flex items-center">
              <MdWarning className="mr-2" />
              You need VERIFIER role to request batch verification. Please contact an admin.
            </span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Verification Request Section */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaClipboardList size={16} />
            <span>Verification Process</span>
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Batch ID:</span>
              <span className="text-purple-300">#{batchId}</span>
            </div>
            {requestId && (
              <div className="flex justify-between">
                <span>Request ID:</span>
                <span className="text-purple-300 font-mono text-xs">{requestId.substring(0, 20)}...</span>
              </div>
            )}
            {verificationStatus && (
              <>
                <div className="flex justify-between">
                  <span>Expected Quantity:</span>
                  <span className="text-blue-300">{verificationStatus.requestQuantity} bags</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Price:</span>
                  <span className="text-blue-300">{verificationStatus.requestPrice} ETH</span>
                </div>
                {verificationStatus.completed && (
                  <>
                    <div className="flex justify-between">
                      <span>Verified Quantity:</span>
                      <span className={verificationStatus.verified ? 'text-green-300' : 'text-red-300'}>
                        {verificationStatus.verifiedQuantity} bags
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={verificationStatus.verified ? 'text-green-300 flex items-center gap-1' : 'text-red-300 flex items-center gap-1'}>
                        {verificationStatus.verified ? (
                          <>
                            <MdCheck size={16} />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <MdClose size={16} />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Section */}
        {progress && (
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">{progress}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={startVerification}
          disabled={isVerifying || !hasVerifierRole || (verificationStatus?.completed || false)}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            isVerifying || !hasVerifierRole || (verificationStatus?.completed || false)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'web3-gradient-button'
          }`}
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
              Verifying...
            </div>
          ) : verificationStatus?.completed ? (
            verificationStatus.verified ? (
              <div className="flex items-center justify-center gap-2">
                <MdCheck size={16} />
                <span>Verification Complete</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <MdClose size={16} />
                <span>Verification Failed</span>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center gap-2">
              <MdCheck size={16} />
              <span>Start Verification</span>
            </div>
          )}
        </button>

        {/* Steps Info */}
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Verification Steps:</h4>
          <ol className="text-xs text-gray-400 space-y-1">
            <li>1. Request sent to Chainlink Functions</li>
            <li>2. Oracle nodes fetch batch data from WAGA API</li>
            <li>3. Verify quantity, price, packaging, and metadata</li>
            <li>4. Return verification result to smart contract</li>
            <li>5. Batch marked as verified (if successful)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
