'use client';

import { useState, useEffect } from 'react';
import { 
  MdSecurity, 
  MdAccountBalance, 
  MdPayment, 
  MdTrendingUp,
  MdRefresh,
  MdInfo,
  MdCheck,
  MdWarning
} from 'react-icons/md';
import { getSigner, getContract } from '@/utils/smartContracts';

// Based on actual WAGATreasury.sol contract functions
export default function ActualTreasuryDashboard() {
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalDistributed: 0,
    currentBalance: 0,
    pendingPayments: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load treasury stats from actual contract - getTreasuryStats()
  const loadTreasuryStats = async () => {
    try {
      setIsLoading(true);
      
      // Get the treasury contract instance
      const signer = await getSigner();
      const treasuryAddress = process.env.NEXT_PUBLIC_WAGA_TREASURY_ADDRESS!;
      const treasuryABI = [
        "function getTreasuryStats() external view returns (uint256 totalCollected, uint256 totalDistributed, uint256 currentBalance)"
      ];
      
      const treasuryContract = getContract(treasuryAddress, treasuryABI, signer);
      
      // Call the actual contract function
      const [totalCollected, totalDistributed, currentBalance] = await treasuryContract.getTreasuryStats();
      
      setStats({
        totalCollected: Number(totalCollected) / 1e6, // Convert from 6 decimal USDC
        totalDistributed: Number(totalDistributed) / 1e6,
        currentBalance: Number(currentBalance) / 1e6,
        pendingPayments: 0 // This would need additional contract calls to calculate
      });
      
    } catch (error) {
      console.error('Error loading treasury stats:', error);
      setMessage({ type: 'error', text: 'Failed to load treasury statistics' });
      
      // Fallback to mock data for demo
      setStats({
        totalCollected: 15000,
        totalDistributed: 12000,
        currentBalance: 3000,
        pendingPayments: 2
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTreasuryStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MdSecurity size={28} className="text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Treasury Management</h2>
            <p className="text-gray-600">USDC payment collection and distribution system</p>
          </div>
        </div>
        
        <button
          onClick={loadTreasuryStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <MdRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' && <MdCheck size={20} />}
          {message.type === 'error' && <MdWarning size={20} />}
          {message.type === 'info' && <MdInfo size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Treasury Statistics - Based on actual contract functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="web3-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Collected</p>
              <p className="text-2xl font-bold text-green-900">
                ${isLoading ? '...' : stats.totalCollected.toLocaleString()} USDC
              </p>
            </div>
            <MdTrendingUp size={32} className="text-green-500" />
          </div>
        </div>

        <div className="web3-card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Distributed</p>
              <p className="text-2xl font-bold text-blue-900">
                ${isLoading ? '...' : stats.totalDistributed.toLocaleString()} USDC
              </p>
            </div>
            <MdPayment size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="web3-card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Current Balance</p>
              <p className="text-2xl font-bold text-purple-900">
                ${isLoading ? '...' : stats.currentBalance.toLocaleString()} USDC
              </p>
            </div>
            <MdAccountBalance size={32} className="text-purple-500" />
          </div>
        </div>

        <div className="web3-card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-900">
                {isLoading ? '...' : stats.pendingPayments}
              </p>
            </div>
            <MdWarning size={32} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Treasury Functions - Based on actual smart contract */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Collection Functions */}
        <div className="web3-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MdPayment size={20} className="text-green-600" />
            Payment Collection
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Direct USDC Payments</h4>
              <p className="text-sm text-gray-600">
                Users pay for batch redemptions via <code>payForBatch()</code> function
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Coinbase Commerce Integration</h4>
              <p className="text-sm text-gray-600">
                Cross-border payments processed via <code>processCoinbasePayment()</code>
              </p>
            </div>
          </div>
        </div>

        {/* Fund Distribution Functions */}
        <div className="web3-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MdAccountBalance size={20} className="text-blue-600" />
            Fund Distribution
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Seller/Processor Payments</h4>
              <p className="text-sm text-gray-600">
                Distribute funds to sellers and processors via <code>distributeFundsDetailed()</code>
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">Offramp Transfers</h4>
              <p className="text-sm text-gray-600">
                Convert USDC to fiat via <code>transferToOfframpPartner()</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="web3-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MdInfo size={20} className="text-gray-600" />
          Treasury Contract Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Contract:</span>
            <span className="ml-2 text-gray-600">WAGATreasury.sol</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Currency:</span>
            <span className="ml-2 text-gray-600">USDC (6 decimals)</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Integrations:</span>
            <span className="ml-2 text-gray-600">Coinbase Commerce, CDP</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Security:</span>
            <span className="ml-2 text-gray-600">ReentrancyGuard, Role-based access</span>
          </div>
        </div>
      </div>

      {/* Business Flow Information */}
      <div className="web3-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MdInfo size={20} className="text-gray-600" />
          Payment Flow
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <div>
              <h4 className="font-medium text-gray-900">Distributor Requests Batch</h4>
              <p className="text-sm text-gray-600">Distributor browses and requests coffee batches</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
            <div>
              <h4 className="font-medium text-gray-900">Batch Verification & Minting</h4>
              <p className="text-sm text-gray-600">Batch is verified and tokens are minted to distributor</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
            <div>
              <h4 className="font-medium text-gray-900">Payment for Redemption</h4>
              <p className="text-sm text-gray-600">Distributor pays USDC when ready to redeem tokens for physical coffee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}