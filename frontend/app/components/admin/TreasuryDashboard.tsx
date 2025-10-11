"use client";

import { useState, useEffect } from "react";
import { 
  MdAccountBalance, 
  MdTrendingUp, 
  MdTrendingDown, 
  MdAttachMoney, 
  MdSavings, 
  MdSwapHoriz,
  MdSecurity,
  MdAnalytics,
  MdWarning,
  MdInfo,
  MdRefresh
} from "react-icons/md";
import { TokenETH, TokenUSDC } from "@web3icons/react";

interface TreasuryStats {
  totalReserves: string;
  usdcBalance: string;
  wagaTokenBalance: string;
  totalRevenue: string;
  protocolFees: string;
  redemptionFund: string;
  monthlyVolume: string;
  averageTransactionValue: string;
  totalTransactions: number;
  reserveRatio: number;
}

interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'fee_collection' | 'redemption_payment';
  amount: string;
  token: 'USDC' | 'WAGA' | 'ETH';
  timestamp: Date;
  from?: string;
  to?: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
}

export default function TreasuryDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [stats, setStats] = useState<TreasuryStats>({
    totalReserves: "0",
    usdcBalance: "0",
    wagaTokenBalance: "0", 
    totalRevenue: "0",
    protocolFees: "0",
    redemptionFund: "0",
    monthlyVolume: "0",
    averageTransactionValue: "0",
    totalTransactions: 0,
    reserveRatio: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<TreasuryTransaction[]>([]);
  const [selectedAction, setSelectedAction] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  
  const [actionForm, setActionForm] = useState({
    amount: "",
    token: "USDC" as "USDC" | "WAGA" | "ETH",
    recipient: "",
    description: ""
  });

  // Load treasury data
  const loadTreasuryData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call treasury smart contract functions
      // For now, using mock data with realistic values
      const mockStats: TreasuryStats = {
        totalReserves: "485,230.45",
        usdcBalance: "342,150.30",
        wagaTokenBalance: "143,080.15",
        totalRevenue: "87,420.80",
        protocolFees: "12,340.50",
        redemptionFund: "275,890.25",
        monthlyVolume: "156,780.90",
        averageTransactionValue: "234.56",
        totalTransactions: 1247,
        reserveRatio: 85.6
      };

      const mockTransactions: TreasuryTransaction[] = [
        {
          id: "tx_001",
          type: "fee_collection",
          amount: "125.50",
          token: "USDC",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          status: "completed",
          description: "Protocol fees from batch verification"
        },
        {
          id: "tx_002", 
          type: "redemption_payment",
          amount: "450.00",
          token: "USDC",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          to: "0x1234...5678",
          status: "completed",
          description: "Coffee redemption payment to distributor"
        },
        {
          id: "tx_003",
          type: "deposit",
          amount: "1000.00",
          token: "USDC",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          from: "0x8765...4321",
          status: "completed",
          description: "Treasury replenishment from partner"
        },
        {
          id: "tx_004",
          type: "withdrawal",
          amount: "500.00", 
          token: "USDC",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          to: "0x9876...1234",
          status: "completed",
          description: "Operational expenses payment"
        }
      ];

      setStats(mockStats);
      setRecentTransactions(mockTransactions);
      
    } catch (err) {
      console.error('Error loading treasury data:', err);
      setError('Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  // Execute treasury action
  const executeTreasuryAction = async () => {
    if (!selectedAction || !actionForm.amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // In a real implementation, this would call treasury smart contract functions
      console.log(`Executing ${selectedAction}:`, actionForm);
      
      // Mock transaction execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`${selectedAction} of ${actionForm.amount} ${actionForm.token} executed successfully`);
      
      // Reset form
      setActionForm({
        amount: "",
        token: "USDC",
        recipient: "",
        description: ""
      });
      setSelectedAction(null);
      
      // Reload data
      await loadTreasuryData();
      
    } catch (err) {
      console.error('Error executing treasury action:', err);
      setError('Failed to execute treasury action');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreasuryData();
  }, []);

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <MdTrendingUp className="text-green-600" />;
      case 'withdrawal': return <MdTrendingDown className="text-red-600" />;
      case 'fee_collection': return <MdAttachMoney className="text-blue-600" />;
      case 'redemption_payment': return <MdSwapHoriz className="text-purple-600" />;
      default: return <MdSwapHoriz className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdAccountBalance size={24} />
            Treasury Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor treasury reserves, revenue streams, and financial operations
          </p>
        </div>
        
        <button
          onClick={loadTreasuryData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <MdRefresh size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-2">
          <MdWarning className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-2">
          <MdInfo className="text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Treasury Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdAccountBalance size={32} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              Total Reserves
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {formatCurrency(stats.totalReserves)}
          </div>
          <div className="text-sm text-blue-700">
            Reserve Ratio: {stats.reserveRatio}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TokenUSDC size={32} variant="branded" />
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
              USDC Balance
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {formatCurrency(stats.usdcBalance)}
          </div>
          <div className="text-sm text-green-700">
            Primary Reserve Asset
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdAttachMoney size={32} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-sm text-purple-700">
            Total Lifetime Revenue
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdSavings size={32} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              Redemption Fund
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {formatCurrency(stats.redemptionFund)}
          </div>
          <div className="text-sm text-amber-700">
            Available for Payouts
          </div>
        </div>
      </div>

      {/* Treasury Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdSecurity size={20} />
          Treasury Operations
        </h3>
        
        {!selectedAction ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedAction('deposit')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <MdTrendingUp size={24} className="text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Deposit Funds</h4>
              <p className="text-sm text-gray-600">Add funds to treasury reserves</p>
            </button>
            
            <button
              onClick={() => setSelectedAction('withdraw')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <MdTrendingDown size={24} className="text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Withdraw Funds</h4>
              <p className="text-sm text-gray-600">Extract funds for operations</p>
            </button>
            
            <button
              onClick={() => setSelectedAction('transfer')}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
            >
              <MdSwapHoriz size={24} className="text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Transfer Assets</h4>
              <p className="text-sm text-gray-600">Move funds between accounts</p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900 capitalize">
                {selectedAction} Funds
              </h4>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actionForm.amount}
                  onChange={(e) => setActionForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token
                </label>
                <select
                  value={actionForm.token}
                  onChange={(e) => setActionForm(prev => ({ ...prev, token: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USDC">USDC</option>
                  <option value="WAGA">WAGA</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
              
              {selectedAction === 'transfer' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={actionForm.recipient}
                    onChange={(e) => setActionForm(prev => ({ ...prev, recipient: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0x..."
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={actionForm.description}
                  onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Purpose of this transaction..."
                />
              </div>
            </div>
            
            <button
              onClick={executeTreasuryAction}
              disabled={loading || !actionForm.amount}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                `Execute ${selectedAction}`
              )}
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdAnalytics size={20} />
          Recent Transactions
        </h3>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionTypeIcon(tx.type)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {tx.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      {tx.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {tx.type === 'withdrawal' || tx.type === 'redemption_payment' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                    <span className="text-xs text-gray-500">{tx.token}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Protocol Fees</span>
              <span className="font-medium">{formatCurrency(stats.protocolFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Volume</span>
              <span className="font-medium">{formatCurrency(stats.monthlyVolume)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Transaction</span>
              <span className="font-medium">{formatCurrency(stats.averageTransactionValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-medium">{stats.totalTransactions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reserve Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">WAGA Tokens</span>
              <span className="font-medium">{stats.wagaTokenBalance} WAGA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reserve Ratio</span>
              <span className={`font-medium ${stats.reserveRatio > 80 ? 'text-green-600' : stats.reserveRatio > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stats.reserveRatio}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Liquidity Status</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}