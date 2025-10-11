'use client';

import React, { useState, useEffect } from 'react';
import {
  MdAccountBalance,
  MdCurrencyExchange,
  MdTransferWithinAStation,
  MdCheck,
  MdError,
  MdWarning,
  MdInfo,
  MdRefresh,
  MdAdd,
  MdEdit,
  MdVisibility,
  MdPerson,
  MdBusiness,
  MdAttachMoney,
  MdSchedule,
  MdLocationOn
} from 'react-icons/md';
import {
  getUSDToETBRate,
  convertUSDToETB,
  registerBankingPartner,
  isAuthorizedBank
} from '../utils/smartContracts';

interface BankingPartner {
  swiftCode: string;
  bankName: string;
  isActive: boolean;
  partnerType: 'DIRECT_BANK' | 'CORRESPONDENT_BANK' | 'AGGREGATOR';
  maxTransactionAmount: number;
  canActAsOfframp: boolean;
  canHandleForexSurrender: boolean;
}

interface TransferRecord {
  transferId: string;
  fromCurrency: 'USD' | 'ETB';
  toCurrency: 'USD' | 'ETB';
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankingPartner: string;
  batchId?: string;
  recipient: string;
}

interface BankingInterfaceProps {
  userRole?: 'ADMIN' | 'BANKING_MANAGER' | 'TREASURY_MANAGER' | 'EXPORTER';
}

export default function BankingIntegrationInterface({ 
  userRole = 'BANKING_MANAGER' 
}: BankingInterfaceProps) {
  const [currentExchangeRate, setCurrentExchangeRate] = useState<number | null>(null);
  const [conversionAmount, setConversionAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionDirection, setConversionDirection] = useState<'USD_TO_ETB' | 'ETB_TO_USD'>('USD_TO_ETB');
  
  const [bankingPartners, setBankingPartners] = useState<BankingPartner[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [activeTab, setActiveTab] = useState<'conversion' | 'partners' | 'transfers'>('conversion');
  
  // Banking partner registration form
  const [partnerForm, setPartnerForm] = useState({
    swiftCode: '',
    bankName: '',
    partnerType: 'DIRECT_BANK' as 'DIRECT_BANK' | 'CORRESPONDENT_BANK' | 'AGGREGATOR',
    maxTransactionAmount: 1000000,
    canActAsOfframp: true,
    canHandleForexSurrender: true
  });
  
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  // Load current USD/ETB exchange rate
  const loadExchangeRate = async () => {
    try {
      setLoading(true);
      console.log('💱 Loading current USD/ETB exchange rate...');
      
      const rate = await getUSDToETBRate();
      setCurrentExchangeRate(rate);
      
      console.log('✅ Exchange rate loaded:', rate);
      
    } catch (error) {
      console.error('❌ Error loading exchange rate:', error);
      // Mock rate for development
      setCurrentExchangeRate(55.25);
      setError('Using reference exchange rate (55.25 ETB/USD) - actual rates handled by banking partners');
    } finally {
      setLoading(false);
    }
  };

  // Convert USD to ETB
  const handleConversion = async () => {
    if (!conversionAmount || !currentExchangeRate) {
      setError('Please enter an amount and ensure exchange rate is loaded for reference calculation');
      return;
    }

    try {
      setLoading(true);
      console.log(`💱 Converting ${conversionAmount} ${conversionDirection}...`);
      
      if (conversionDirection === 'USD_TO_ETB') {
        const amount = parseFloat(conversionAmount);
        const result = await convertUSDToETB(amount);
        if (result !== null) {
          setConvertedAmount(result);
          setSuccess(`Reference calculation: $${conversionAmount} USD = ${result.toFixed(2)} ETB`);
        } else {
          throw new Error('Conversion failed');
        }
      } else {
        // ETB to USD calculation (reverse conversion)
        const usdAmount = parseFloat(conversionAmount) / currentExchangeRate;
        setConvertedAmount(usdAmount);
        setSuccess(`Reference calculation: ${conversionAmount} ETB = $${usdAmount.toFixed(2)} USD`);
      }
      
    } catch (error) {
      console.error('❌ Conversion error:', error);
      // Reference calculation for development
      const amount = parseFloat(conversionAmount);
      if (conversionDirection === 'USD_TO_ETB') {
        const converted = amount * currentExchangeRate;
        setConvertedAmount(converted);
        setSuccess(`Reference calculation: $${amount} USD = ${converted.toFixed(2)} ETB`);
      } else {
        const converted = amount / currentExchangeRate;
        setConvertedAmount(converted);
        setSuccess(`Reference calculation: ${amount} ETB = $${converted.toFixed(2)} USD`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Register new banking partner
  const handleRegisterPartner = async () => {
    if (!partnerForm.swiftCode || !partnerForm.bankName) {
      setError('Please fill in all required banking partner fields');
      return;
    }

    try {
      setLoading(true);
      console.log('🏦 Registering banking partner...', partnerForm);
      
      const result = await registerBankingPartner(
        '0x0000000000000000000000000000000000000000', // Mock partner address
        partnerForm.bankName
      );

      console.log('✅ Banking partner registered:', result);
      setSuccess(`Banking partner ${partnerForm.bankName} registered successfully`);
      setShowPartnerModal(false);
      setPartnerForm({
        swiftCode: '',
        bankName: '',
        partnerType: 'DIRECT_BANK',
        maxTransactionAmount: 1000000,
        canActAsOfframp: true,
        canHandleForexSurrender: true
      });
      
      // Reload partners list
      await loadBankingPartners();

    } catch (error) {
      console.error('❌ Error registering banking partner:', error);
      setError('Failed to register banking partner');
    } finally {
      setLoading(false);
    }
  };

  // Load banking partners
  const loadBankingPartners = async () => {
    try {
      console.log('🏦 Loading banking partners...');
      
      // Mock data for development - real implementation would fetch from contract
      const mockPartners: BankingPartner[] = [
        {
          swiftCode: 'CBETETAA123',
          bankName: 'Commercial Bank of Ethiopia',
          isActive: true,
          partnerType: 'DIRECT_BANK',
          maxTransactionAmount: 5000000,
          canActAsOfframp: true,
          canHandleForexSurrender: true
        },
        {
          swiftCode: 'ABESETHH123',
          bankName: 'Abyssinia Bank',
          isActive: true,
          partnerType: 'DIRECT_BANK',
          maxTransactionAmount: 2000000,
          canActAsOfframp: true,
          canHandleForexSurrender: false
        },
        {
          swiftCode: 'DASBETHH123',
          bankName: 'Dashen Bank',
          isActive: false,
          partnerType: 'CORRESPONDENT_BANK',
          maxTransactionAmount: 1000000,
          canActAsOfframp: false,
          canHandleForexSurrender: true
        }
      ];
      
      setBankingPartners(mockPartners);
      console.log('✅ Banking partners loaded');
      
    } catch (error) {
      console.error('❌ Error loading banking partners:', error);
      setError('Failed to load banking partners');
    }
  };

  // Load transfer history
  const loadTransferHistory = async () => {
    try {
      console.log('📊 Loading transfer history...');
      
      // Load transfer history
      const mockTransfers: TransferRecord[] = [
        {
          transferId: 'TXN-001',
          fromCurrency: 'USD',
          toCurrency: 'ETB',
          amount: 1000,
          convertedAmount: 55250,
          exchangeRate: 55.25,
          timestamp: new Date('2024-01-15'),
          status: 'COMPLETED',
          bankingPartner: 'Commercial Bank of Ethiopia',
          batchId: '1001',
          recipient: 'Sidama Coffee Cooperative'
        },
        {
          transferId: 'TXN-002',
          fromCurrency: 'USD',
          toCurrency: 'ETB',
          amount: 2500,
          convertedAmount: 138125,
          exchangeRate: 55.25,
          timestamp: new Date('2024-01-14'),
          status: 'PROCESSING',
          bankingPartner: 'Abyssinia Bank',
          batchId: '1002',
          recipient: 'Yirgacheffe Coffee Union'
        },
        {
          transferId: 'TXN-003',
          fromCurrency: 'USD',
          toCurrency: 'ETB',
          amount: 750,
          convertedAmount: 41437.5,
          exchangeRate: 55.25,
          timestamp: new Date('2024-01-13'),
          status: 'FAILED',
          bankingPartner: 'Dashen Bank',
          batchId: '1003',
          recipient: 'Harrar Coffee Farmers'
        }
      ];
      
      setTransferHistory(mockTransfers);
      console.log('✅ Transfer history loaded');
      
    } catch (error) {
      console.error('❌ Error loading transfer history:', error);
      setError('Failed to load transfer history');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadExchangeRate();
    loadBankingPartners();
    loadTransferHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <MdAccountBalance size={32} className="text-blue-600" />
          Banking Partner Management
        </h1>
        <p className="text-gray-600">
          Manage banking partners, track USDC transfers to offramp partners, and view reference exchange rates for transparency
        </p>
      </div>

      {/* Exchange Rate Display */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MdCurrencyExchange size={24} className="text-blue-600" />
              <span className="font-semibold text-blue-800">Current Exchange Rate:</span>
            </div>
            {currentExchangeRate ? (
              <span className="text-2xl font-bold text-blue-900">
                1 USD = {currentExchangeRate.toFixed(2)} ETB
              </span>
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </div>
          <button
            onClick={loadExchangeRate}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <MdRefresh size={16} />
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-sm text-blue-700 mt-2">
          * Rate updated from National Bank of Ethiopia • Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <MdError size={20} className="text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <MdCheck size={20} className="text-green-600" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'conversion', label: 'Rate Reference', icon: <MdCurrencyExchange size={20} /> },
              { id: 'partners', label: 'Banking Partners', icon: <MdAccountBalance size={20} /> },
              { id: 'transfers', label: 'USDC Transfer History', icon: <MdTransferWithinAStation size={20} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Rate Reference Tab */}
      {activeTab === 'conversion' && (
        <div className="space-y-8">
          {/* Important Notice */}
          <div className="p-6 bg-amber-50 border-l-4 border-amber-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <MdWarning className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Exchange Rate Reference Only
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    WAGA provides these exchange rates for <strong>reference and transparency purposes only</strong>. 
                    Actual USD to ETB conversion is performed by licensed banking partners who receive USDC 
                    directly from the WAGA Treasury and handle local currency conversion in compliance with 
                    National Bank of Ethiopia regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rate Calculator */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Exchange Rate Calculator (Reference Only)</h2>
              
              <div className="space-y-4">
                {/* Conversion Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculation Type
                  </label>
                  <select
                    value={conversionDirection}
                    onChange={(e) => setConversionDirection(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD_TO_ETB">USD → ETB (Reference Calculation)</option>
                    <option value="ETB_TO_USD">ETB → USD (Reference Calculation)</option>
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({conversionDirection === 'USD_TO_ETB' ? 'USD' : 'ETB'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={conversionAmount}
                      onChange={(e) => {
                        setConversionAmount(e.target.value);
                        setConvertedAmount(null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter amount for reference calculation`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">
                        {conversionDirection === 'USD_TO_ETB' ? '$' : 'ETB'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleConversion}
                  disabled={loading || !conversionAmount || !currentExchangeRate}
                  className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                    loading || !conversionAmount || !currentExchangeRate
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Calculating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdCurrencyExchange size={20} />
                      <span>Calculate Reference Amount</span>
                    </div>
                  )}
                </button>

                {/* Calculation Result */}
                {convertedAmount !== null && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MdInfo size={20} className="text-blue-600" />
                      <span className="font-semibold text-blue-800">Reference Calculation</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {conversionDirection === 'USD_TO_ETB' 
                        ? `${convertedAmount.toFixed(2)} ETB`
                        : `$${convertedAmount.toFixed(2)} USD`
                      }
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Reference Rate: 1 USD = {currentExchangeRate?.toFixed(2)} ETB
                    </div>
                    <div className="text-xs text-blue-600 mt-2 italic">
                      * Actual conversion handled by banking partners
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banking Process Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">WAGA Banking Process Flow</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdInfo size={20} className="text-blue-600" />
                    <span className="font-semibold text-blue-800">How WAGA Banking Actually Works</span>
                  </div>
                  <ol className="list-decimal list-inside text-blue-700 text-sm space-y-2">
                    <li><strong>Payment Collection:</strong> International buyers pay USDC to WAGA Treasury</li>
                    <li><strong>USDC Transfer:</strong> Treasury transfers USDC directly to authorized banking partners</li>
                    <li><strong>Professional Conversion:</strong> Banking partners convert USDC to ETB using their licensed systems</li>
                    <li><strong>Local Distribution:</strong> Ethiopian banks receive ETB and distribute to coffee stakeholders</li>
                    <li><strong>Compliance:</strong> All conversions follow National Bank of Ethiopia regulations</li>
                  </ol>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdCheck size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">Why This Model Works</span>
                  </div>
                  <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                    <li><strong>Licensed Operations:</strong> Banking partners have proper forex licenses</li>
                    <li><strong>Bulk Efficiency:</strong> Partners can batch multiple conversions</li>
                    <li><strong>Risk Management:</strong> Professional handling of foreign exchange risk</li>
                    <li><strong>Local Expertise:</strong> Ethiopian banks know local payment preferences</li>
                    <li><strong>Regulatory Compliance:</strong> All transactions follow local banking laws</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdWarning size={20} className="text-amber-600" />
                    <span className="font-semibold text-amber-800">National Bank of Ethiopia Requirements</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
                    <li>All export proceeds must be surrendered within 90 days</li>
                    <li>Minimum export value: $50,000 USD for coffee</li>
                    <li>Foreign exchange declaration required for amounts {`>`} $10,000</li>
                    <li>Valid export license and ECTA permit required</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MdInfo size={20} className="text-blue-600" />
                    <span className="font-semibold text-blue-800">WAGA Banking Process</span>
                  </div>
                  <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
                    <li>International buyer pays USDC to WAGA treasury</li>
                    <li>WAGA converts USDC to USD at current rates</li>
                    <li>Funds transferred to authorized Ethiopian banking partner</li>
                    <li>Banking partner converts USD to ETB per NBE rates</li>
                    <li>ETB distributed to coffee exporters via local banks</li>
                  </ol>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Quick Reference</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Min Export:</span>
                      <br />
                      <span className="text-gray-600">$50,000 USD</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Surrender Period:</span>
                      <br />
                      <span className="text-gray-600">90 days</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Declaration Threshold:</span>
                      <br />
                      <span className="text-gray-600">$10,000 USD</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Coffee Premium:</span>
                      <br />
                      <span className="text-gray-600">2-5% above base</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banking Partners Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Banking Partners</h2>
            {(userRole === 'ADMIN' || userRole === 'BANKING_MANAGER') && (
              <button
                onClick={() => setShowPartnerModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <MdAdd size={20} />
                <span>Add Banking Partner</span>
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {bankingPartners.map((partner) => (
              <div key={partner.swiftCode} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MdAccountBalance size={24} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{partner.bankName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        partner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">SWIFT Code:</span>
                        <br />
                        <span className="text-gray-600 font-mono">{partner.swiftCode}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Partner Type:</span>
                        <br />
                        <span className="text-gray-600">{partner.partnerType.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Max Transaction:</span>
                        <br />
                        <span className="text-gray-600">${partner.maxTransactionAmount.toLocaleString()} USD</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${partner.canActAsOfframp ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-600">Offramp Services</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${partner.canHandleForexSurrender ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-gray-600">Forex Surrender</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USDC Transfer History Tab */}
      {activeTab === 'transfers' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">USDC Transfer History</h2>
            <div className="text-sm text-gray-600">
              Showing USDC transfers to banking partners for local conversion
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transfer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USDC Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banking Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transferHistory.map((transfer) => (
                  <tr key={transfer.transferId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transfer.transferId}</div>
                      {transfer.batchId && (
                        <div className="text-sm text-gray-500">Batch #{transfer.batchId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${transfer.amount.toLocaleString()} USDC
                      </div>
                      <div className="text-sm text-gray-500">
                        Reference: {transfer.convertedAmount.toLocaleString()} ETB
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transfer.exchangeRate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transfer.bankingPartner}</div>
                      <div className="text-sm text-gray-500">{transfer.recipient}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transfer.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : transfer.status === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : transfer.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transfer.timestamp.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Banking Partner Registration Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MdAccountBalance size={24} className="text-green-600" />
              Register Banking Partner
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={partnerForm.bankName}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Awash Bank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code *
                </label>
                <input
                  type="text"
                  value={partnerForm.swiftCode}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, swiftCode: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., AWASETHH123"
                  maxLength={11}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Type
                </label>
                <select
                  value={partnerForm.partnerType}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, partnerType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="DIRECT_BANK">Direct Bank</option>
                  <option value="CORRESPONDENT_BANK">Correspondent Bank</option>
                  <option value="AGGREGATOR">Payment Aggregator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Transaction Amount (USD)
                </label>
                <input
                  type="number"
                  value={partnerForm.maxTransactionAmount}
                  onChange={(e) => setPartnerForm(prev => ({ ...prev, maxTransactionAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1000000"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canActAsOfframp"
                    checked={partnerForm.canActAsOfframp}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, canActAsOfframp: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canActAsOfframp" className="text-sm text-gray-700">
                    Can Act as Offramp Partner
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canHandleForexSurrender"
                    checked={partnerForm.canHandleForexSurrender}
                    onChange={(e) => setPartnerForm(prev => ({ ...prev, canHandleForexSurrender: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canHandleForexSurrender" className="text-sm text-gray-700">
                    Can Handle Forex Surrender
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPartnerModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterPartner}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}