import { ethers } from 'ethers';
import { PROOF_OF_RESERVE_ADDRESS, PROOF_OF_RESERVE_ABI } from './smartContracts';

/**
 * Monitor verification completion events and sync to database
 */
export class VerificationMonitor {
  private provider: ethers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private isListening = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(
          PROOF_OF_RESERVE_ADDRESS,
          PROOF_OF_RESERVE_ABI,
          this.provider
        );
      }
    } catch (error) {
      console.error('Failed to initialize verification monitor:', error);
    }
  }

  /**
   * Start listening for verification completion events
   */
  startListening() {
    if (!this.contract || this.isListening) {
      console.log('Contract not available or already listening');
      return;
    }

    console.log('🔍 Starting verification completion monitoring...');
    this.isListening = true;

    // Listen for ReserveVerificationCompleted events
    this.contract.on('ReserveVerificationCompleted', async (requestId, batchId, verified, event) => {
      console.log('✅ Verification completed:', {
        requestId: requestId.toString(),
        batchId: batchId.toString(),
        verified,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      });

      try {
        // Sync verification result to database
        await this.syncVerificationResult({
          requestId: requestId.toString(),
          batchId: batchId.toString(),
          status: 'completed',
          transactionHash: event.transactionHash,
          verificationResults: {
            verified,
            blockNumber: event.blockNumber,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to sync verification result:', error);
      }
    });

    console.log('✅ Verification monitor active');
  }

  /**
   * Stop listening for events
   */
  stopListening() {
    if (this.contract && this.isListening) {
      this.contract.removeAllListeners('ReserveVerificationCompleted');
      this.isListening = false;
      console.log('🛑 Verification monitoring stopped');
    }
  }

  /**
   * Sync verification result to database
   */
  private async syncVerificationResult(verificationData: {
    requestId: string;
    batchId: string;
    status: string;
    transactionHash: string;
    verificationResults: any;
  }) {
    try {
      const response = await fetch('/api/waga/sync-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('💾 Verification synced to database:', result);
      
      // Emit custom event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('verificationCompleted', {
          detail: { requestId: verificationData.requestId, batchId: verificationData.batchId, verified: verificationData.verificationResults.verified }
        }));
      }

      return result;
    } catch (error) {
      console.error('Database sync failed:', error);
      throw error;
    }
  }

  /**
   * Get the listening status
   */
  isMonitoring(): boolean {
    return this.isListening;
  }
}

// Global instance
export const verificationMonitor = new VerificationMonitor();

// Auto-start monitoring when the module loads in browser
if (typeof window !== 'undefined') {
  verificationMonitor.startListening();
}