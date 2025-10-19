"use client";

import { useState, useEffect } from "react";
import { 
  MdAccountBalance, 
  MdAdd, 
  MdSwapHoriz, 
  MdDelete, 
  MdRefresh,
  MdVerified,
  MdError,
  MdInfo
} from "react-icons/md";
import {
  registerBankingPartner,
  getBankingCapabilities,
  getBankingPartner,
  isAuthorizedBank,
  getUSDToETBRate,
  convertUSDToETB
} from "@/utils/smartContracts";

interface BankingPartner {
  address: string;
  name: string;
  swiftCode: string;
  canOfframp: boolean;
  isAuthorized: boolean;
  capabilities?: {
    canActAsOfframp: boolean;
    canHandleForexSurrender: boolean;
    partnerType: number;
    maxTransactionAmount: number;
    isActive: boolean;
  };
}

export default function BankingIntegrationDashboard() {
  const [partners, setPartners] = useState<BankingPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'partners' | 'register' | 'exchange'>('partners');
  
  // Registration form state
  const [newPartner, setNewPartner] = useState({
    address: '',
    name: '',
    swiftCode: '',
    canActAsOfframp: true,
    canHandleForexSurrender: true,
    partnerType: 1,
    maxTransactionAmount: 1000000, // 1M USDC
    isActive: true
  });

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [etbAmount, setEtbAmount] = useState<number | null>(null);

  useEffect(() => {
    loadBankingData();
    loadExchangeRate();
  }, []);

  const loadBankingData = async () => {
    try {
      setLoading(true);
      console.log('Loading banking partner data...');
      
      // This would typically come from a contract call that lists all partners
      // For now, we'll load data for known partners if any exist
      const mockPartners: BankingPartner[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Commercial Bank of Ethiopia',
          swiftCode: 'CBETETAA',
          canOfframp: true,
          isAuthorized: true
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'Dashen Bank',
          swiftCode: 'DASHENET',
          canOfframp: true,
          isAuthorized: false
        }
      ];
      
      // Load actual data for each partner
      const partnersWithData: BankingPartner[] = [];
      for (const partner of mockPartners) {
        try {
          const isAuth = await isAuthorizedBank(partner.address);
          const partnerInfo = await getBankingPartner(partner.address);
          
          partnersWithData.push({
            ...partner,
            isAuthorized: isAuth,
            swiftCode: partnerInfo?.swiftCode || partner.swiftCode,
            name: partnerInfo?.bankName || partner.name,
            canOfframp: partnerInfo?.canOfframp || partner.canOfframp
          });
        } catch (error) {
          console.error(`Error loading data for partner ${partner.address}:`, error);
          partnersWithData.push(partner);
        }
      }
      
      setPartners(partnersWithData);
      console.log('Banking partner data loaded:', partnersWithData);
      
    } catch (error) {
      console.error('Error loading banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const rate = await getUSDToETBRate();
      setExchangeRate(rate);
      console.log('Current USD/ETB rate:', rate);
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  const handleRegisterPartner = async () => {
    if (!newPartner.address || !newPartner.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await registerBankingPartner(newPartner.address, newPartner.name);
      
      if (result.success) {
        alert(`✅ Banking partner registered: ${newPartner.name}`);
        setNewPartner({
          address: '',
          name: '',
          swiftCode: '',
          canActAsOfframp: true,
          canHandleForexSurrender: true,
          partnerType: 1,
          maxTransactionAmount: 1000000,
          isActive: true
        });
        await loadBankingData();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error registering partner:', error);
      alert(`❌ Error registering partner: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertCurrency = async () => {
    if (!usdAmount) {
      alert('Please enter USD amount');
      return;
    }

    try {
      const etb = await convertUSDToETB(parseFloat(usdAmount));
      setEtbAmount(etb);
    } catch (error) {
      console.error('Error converting currency:', error);
      alert(`Error converting currency: ${error}`);
    }
  };

  const getPartnerStatusIcon = (partner: BankingPartner) => {
    if (partner.isAuthorized && partner.canOfframp) {
      return <MdVerified className="text-green-500" size={20} />;
    } else if (partner.isAuthorized) {
      return <MdInfo className="text-blue-500" size={20} />;
    } else {
      return <MdError className="text-red-500" size={20} />;
    }
  };

  const getPartnerStatus = (partner: BankingPartner) => {
    if (partner.isAuthorized && partner.canOfframp) {
      return 'Active Offramp';
    } else if (partner.isAuthorized) {
      return 'Authorized';
    } else {
      return 'Unauthorized';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Banking Integration Management</h2>
            <p className="text-blue-100">Manage banking partners, offramp services, and currency exchange</p>
          </div>
          <MdAccountBalance size={48} className="text-blue-200" />
        </div>
      </div>

      {/* Exchange Rate Display */}
      {exchangeRate && (
        <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Exchange Rate</p>
              <p className="text-xl font-semibold text-green-600">1 USD = {exchangeRate.toFixed(2)} ETB</p>
            </div>
            <button
              onClick={loadExchangeRate}
              className="text-gray-400 hover:text-gray-600"
            >
              <MdRefresh size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'partners'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdAccountBalance className="inline mr-2" />
          Banking Partners
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'register'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdAdd className="inline mr-2" />
          Register Partner
        </button>
        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'exchange'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdSwapHoriz className="inline mr-2" />
          Currency Exchange
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Banking Partners</h3>
              <button
                onClick={loadBankingData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <MdRefresh size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Bank Name</th>
                    <th className="text-left py-2">SWIFT Code</th>
                    <th className="text-left py-2">Address</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{partner.name}</td>
                      <td className="py-2 font-mono text-sm">{partner.swiftCode}</td>
                      <td className="py-2 font-mono text-xs">
                        {partner.address.slice(0, 8)}...{partner.address.slice(-6)}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          {getPartnerStatusIcon(partner)}
                          <span>{getPartnerStatus(partner)}</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex space-x-2 text-xs">
                          {partner.canOfframp && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Offramp</span>
                          )}
                          {partner.isAuthorized && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Authorized</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Register New Banking Partner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Address *
                </label>
                <input
                  type="text"
                  value={newPartner.address}
                  onChange={(e) => setNewPartner({...newPartner, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Commercial Bank of Ethiopia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code
                </label>
                <input
                  type="text"
                  value={newPartner.swiftCode}
                  onChange={(e) => setNewPartner({...newPartner, swiftCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CBETETAA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Transaction Amount (USDC)
                </label>
                <input
                  type="number"
                  value={newPartner.maxTransactionAmount}
                  onChange={(e) => setNewPartner({...newPartner, maxTransactionAmount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canActAsOfframp"
                  checked={newPartner.canActAsOfframp}
                  onChange={(e) => setNewPartner({...newPartner, canActAsOfframp: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="canActAsOfframp" className="text-sm">Can Act as Offramp</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canHandleForex"
                  checked={newPartner.canHandleForexSurrender}
                  onChange={(e) => setNewPartner({...newPartner, canHandleForexSurrender: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="canHandleForex" className="text-sm">Handle Forex Surrender</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newPartner.isActive}
                  onChange={(e) => setNewPartner({...newPartner, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
            </div>
            
            <button
              onClick={handleRegisterPartner}
              disabled={loading || !newPartner.address || !newPartner.name}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Banking Partner'}
            </button>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Currency Exchange Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  USD Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="100.00"
                />
              </div>
              <div>
                <button
                  onClick={handleConvertCurrency}
                  disabled={!usdAmount}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Convert to ETB
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ETB Amount
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {etbAmount ? etbAmount.toFixed(2) : '0.00'} ETB
                </div>
              </div>
            </div>
            
            {exchangeRate && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Current Rate:</strong> 1 USD = {exchangeRate.toFixed(2)} ETB
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Rates are updated from the WAGA banking oracle and may include transaction fees
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}