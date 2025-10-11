"use client";

import { useState, useEffect } from "react";
import { 
  MdSecurity, 
  MdTrendingUp, 
  MdWarning, 
  MdInfo, 
  MdRefresh,
  MdLock,
  MdAccountCircle,
  MdSwapHoriz,
  MdAnalytics,
  MdSettings
} from "react-icons/md";
import { TokenETH, TokenUSDC } from "@web3icons/react";

interface CDPInfo {
  id: string;
  collateralAmount: string;
  collateralType: 'WAGA' | 'ETH';
  debtAmount: string;
  collateralizationRatio: number;
  liquidationPrice: string;
  availableToGenerate: string;
  availableToFree: string;
  status: 'active' | 'liquidated' | 'closed';
  createdAt: Date;
  lastUpdate: Date;
}

interface CDPAction {
  type: 'open' | 'add_collateral' | 'generate_dai' | 'repay_dai' | 'free_collateral' | 'close';
  amount: string;
  timestamp: Date;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
}

interface CDPMetrics {
  totalCDPs: number;
  totalCollateral: string;
  totalDebt: string;
  averageCollateralizationRatio: number;
  atRiskCDPs: number;
  monthlyLiquidations: number;
  protocolFees: string;
}

export default function CDPIntegrationDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [cdps, setCDPs] = useState<CDPInfo[]>([]);
  const [metrics, setMetrics] = useState<CDPMetrics>({
    totalCDPs: 0,
    totalCollateral: "0",
    totalDebt: "0",
    averageCollateralizationRatio: 0,
    atRiskCDPs: 0,
    monthlyLiquidations: 0,
    protocolFees: "0"
  });
  
  const [recentActions, setRecentActions] = useState<CDPAction[]>([]);
  const [selectedCDP, setSelectedCDP] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'add_collateral' | 'generate_dai' | 'repay_dai' | 'free_collateral' | null>(null);
  
  const [actionForm, setActionForm] = useState({
    amount: "",
    collateralType: "WAGA" as "WAGA" | "ETH"
  });

  const [newCDPForm, setNewCDPForm] = useState({
    collateralAmount: "",
    collateralType: "WAGA" as "WAGA" | "ETH"
  });

  // Load CDP data
  const loadCDPData = async () => {
    try {
      setLoading(true);
      
      // Mock CDP data - in real implementation would call smart contract functions
      const mockCDPs: CDPInfo[] = [
        {
          id: "123",
          collateralAmount: "1000.0",
          collateralType: "WAGA",
          debtAmount: "450.0",
          collateralizationRatio: 222.2,
          liquidationPrice: "0.675",
          availableToGenerate: "100.0",
          availableToFree: "250.0",
          status: "active",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: "124",
          collateralAmount: "0.5",
          collateralType: "ETH",
          debtAmount: "800.0",
          collateralizationRatio: 187.5,
          liquidationPrice: "1,280.00",
          availableToGenerate: "50.0",
          availableToFree: "0.05",
          status: "active",
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

      const mockMetrics: CDPMetrics = {
        totalCDPs: 2,
        totalCollateral: "2,500.0", 
        totalDebt: "1,250.0",
        averageCollateralizationRatio: 204.8,
        atRiskCDPs: 0,
        monthlyLiquidations: 0,
        protocolFees: "12.50"
      };

      const mockActions: CDPAction[] = [
        {
          type: "add_collateral",
          amount: "250.0",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          txHash: "0xabc123...",
          status: "completed"
        },
        {
          type: "generate_dai",
          amount: "100.0",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          txHash: "0xdef456...",
          status: "completed"
        }
      ];

      setCDPs(mockCDPs);
      setMetrics(mockMetrics);
      setRecentActions(mockActions);
      
    } catch (err) {
      console.error('Error loading CDP data:', err);
      setError('Failed to load CDP data');
    } finally {
      setLoading(false);
    }
  };

  // Create new CDP
  const createCDP = async () => {
    if (!newCDPForm.collateralAmount) {
      setError('Please enter collateral amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Mock CDP creation
      console.log('Creating CDP with:', newCDPForm);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`CDP created successfully with ${newCDPForm.collateralAmount} ${newCDPForm.collateralType} collateral`);
      
      setNewCDPForm({
        collateralAmount: "",
        collateralType: "WAGA"
      });
      
      await loadCDPData();
      
    } catch (err) {
      console.error('Error creating CDP:', err);
      setError('Failed to create CDP');
    } finally {
      setLoading(false);
    }
  };

  // Execute CDP action
  const executeCDPAction = async () => {
    if (!selectedCDP || !actionType || !actionForm.amount) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Mock action execution
      console.log(`Executing ${actionType} on CDP ${selectedCDP}:`, actionForm);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`${actionType.replace('_', ' ')} executed successfully`);
      
      setActionForm({
        amount: "",
        collateralType: "WAGA"
      });
      setActionType(null);
      setSelectedCDP(null);
      
      await loadCDPData();
      
    } catch (err) {
      console.error('Error executing CDP action:', err);
      setError('Failed to execute CDP action');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCDPData();
  }, []);

  const getRiskLevel = (ratio: number) => {
    if (ratio > 200) return { level: 'Low', color: 'text-green-600 bg-green-100' };
    if (ratio > 150) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'High', color: 'text-red-600 bg-red-100' };
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(value));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdSecurity size={24} />
            CDP Integration Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage Collateralized Debt Positions for protocol liquidity
          </p>
        </div>
        
        <button
          onClick={loadCDPData}
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

      {/* CDP Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdAccountCircle size={32} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              Total CDPs
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {metrics.totalCDPs}
          </div>
          <div className="text-sm text-blue-700">
            Active Positions
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdLock size={32} className="text-green-600" />
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Collateral
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {formatCurrency(metrics.totalCollateral)}
          </div>
          <div className="text-sm text-green-700">
            Total Locked Value
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TokenUSDC size={32} variant="branded" />
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              Debt
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {formatCurrency(metrics.totalDebt)}
          </div>
          <div className="text-sm text-purple-700">
            Outstanding DAI
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <MdTrendingUp size={32} className="text-amber-600" />
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              Avg Ratio
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {metrics.averageCollateralizationRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-amber-700">
            Health Score
          </div>
        </div>
      </div>

      {/* Create New CDP */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdSettings size={20} />
          Create New CDP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Type
            </label>
            <select
              value={newCDPForm.collateralType}
              onChange={(e) => setNewCDPForm(prev => ({ ...prev, collateralType: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="WAGA">WAGA Token</option>
              <option value="ETH">Ethereum (ETH)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={newCDPForm.collateralAmount}
              onChange={(e) => setNewCDPForm(prev => ({ ...prev, collateralAmount: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={createCDP}
              disabled={loading || !newCDPForm.collateralAmount}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create CDP'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active CDPs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MdAnalytics size={20} />
          Active CDPs
        </h3>
        
        {cdps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active CDPs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cdps.map((cdp) => {
              const risk = getRiskLevel(cdp.collateralizationRatio);
              return (
                <div key={cdp.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">CDP #{cdp.id}</h4>
                      <p className="text-sm text-gray-600">
                        Created {cdp.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${risk.color}`}>
                        {risk.level} Risk
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {cdp.collateralizationRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Collateral</p>
                      <p className="font-medium">
                        {cdp.collateralAmount} {cdp.collateralType}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Debt</p>
                      <p className="font-medium">{formatCurrency(cdp.debtAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Liquidation Price</p>
                      <p className="font-medium">{formatCurrency(cdp.liquidationPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available to Generate</p>
                      <p className="font-medium">{formatCurrency(cdp.availableToGenerate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCDP(cdp.id);
                        setActionType('add_collateral');
                      }}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Add Collateral
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCDP(cdp.id);
                        setActionType('generate_dai');
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Generate DAI
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCDP(cdp.id);
                        setActionType('repay_dai');
                      }}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Repay DAI
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCDP(cdp.id);
                        setActionType('free_collateral');
                      }}
                      className="px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                    >
                      Free Collateral
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CDP Action Modal */}
      {selectedCDP && actionType && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              {actionType.replace('_', ' ').toUpperCase()} - CDP #{selectedCDP}
            </h4>
            <button
              onClick={() => {
                setSelectedCDP(null);
                setActionType(null);
                setActionForm({ amount: "", collateralType: "WAGA" });
              }}
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
            
            {actionType === 'add_collateral' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Type
                </label>
                <select
                  value={actionForm.collateralType}
                  onChange={(e) => setActionForm(prev => ({ ...prev, collateralType: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="WAGA">WAGA Token</option>
                  <option value="ETH">Ethereum (ETH)</option>
                </select>
              </div>
            )}
          </div>
          
          <button
            onClick={executeCDPAction}
            disabled={loading || !actionForm.amount}
            className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Execute ${actionType.replace('_', ' ')}`
            )}
          </button>
        </div>
      )}

      {/* Recent Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent CDP Actions</h3>
        
        {recentActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent actions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MdSwapHoriz className="text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {action.type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {action.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(action.amount)}
                  </div>
                  <div className="text-xs text-gray-500">{action.txHash}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}