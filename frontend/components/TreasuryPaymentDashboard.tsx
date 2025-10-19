"use client";

import { useState, useEffect } from "react";
import { 
  MdPayment, 
  MdAccountBalance, 
  MdSwapHoriz, 
  MdCheckCircle, 
  MdPending,
  MdError,
  MdRefresh,
  MdAdd
} from "react-icons/md";
import {
  setBatchPayment,
  payForBatch,
  transferToOfframpPartner,
  checkPaymentStatus,
  getBatchPaymentAmount,
  getActiveBatchIds,
  getBatchInfoWithMetadata
} from "@/utils/smartContracts";

interface PaymentInfo {
  batchId: string;
  batchInfo?: any;
  paymentAmount?: number;
  isPaid: boolean;
  paymentStatus?: 'none' | 'pending' | 'paid' | 'transferred';
}

export default function TreasuryPaymentDashboard() {
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [offrampAddress, setOfframpAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'set-payment' | 'pay-batch' | 'offramp-transfer'>('set-payment');

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      console.log('Loading treasury payment data...');
      
      const batchIds = await getActiveBatchIds();
      const paymentInfos: PaymentInfo[] = [];
      
      for (const batchId of batchIds) {
        try {
          const batchInfo = await getBatchInfoWithMetadata(batchId);
          const paymentAmount = await getBatchPaymentAmount(batchId);
          const isPaid = buyerAddress ? await checkPaymentStatus(buyerAddress, batchId) : false;
          
          paymentInfos.push({
            batchId,
            batchInfo,
            paymentAmount: paymentAmount || undefined,
            isPaid,
            paymentStatus: paymentAmount ? (isPaid ? 'paid' : 'pending') : 'none'
          });
        } catch (error) {
          console.error(`Error loading data for batch ${batchId}:`, error);
        }
      }
      
      setPayments(paymentInfos);
      console.log('Treasury payment data loaded:', paymentInfos);
      
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPayment = async () => {
    if (!selectedBatch || !paymentAmount) {
      alert('Please select a batch and enter payment amount');
      return;
    }

    try {
      setLoading(true);
      const result = await setBatchPayment(selectedBatch, parseFloat(paymentAmount));
      
      if (result.success) {
        alert(`✅ Payment requirement set: ${paymentAmount} USDC for batch ${selectedBatch}`);
        setPaymentAmount('');
        await loadPaymentData();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error setting payment:', error);
      alert(`❌ Error setting payment: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayForBatch = async () => {
    if (!selectedBatch || !paymentAmount) {
      alert('Please select a batch and enter payment amount');
      return;
    }

    try {
      setLoading(true);
      const result = await payForBatch(selectedBatch, parseFloat(paymentAmount));
      
      if (result.success) {
        alert(`✅ Payment completed: ${paymentAmount} USDC for batch ${selectedBatch}`);
        setPaymentAmount('');
        await loadPaymentData();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error paying for batch:', error);
      alert(`❌ Error paying for batch: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOfframpTransfer = async () => {
    if (!selectedBatch || !buyerAddress || !offrampAddress || !paymentAmount) {
      alert('Please fill in all fields for offramp transfer');
      return;
    }

    try {
      setLoading(true);
      const result = await transferToOfframpPartner(
        selectedBatch,
        buyerAddress,
        offrampAddress,
        parseFloat(paymentAmount)
      );
      
      if (result.success) {
        alert(`✅ Offramp transfer completed: ${paymentAmount} USDC to ${offrampAddress}`);
        setBuyerAddress('');
        setOfframpAddress('');
        setPaymentAmount('');
        await loadPaymentData();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in offramp transfer:', error);
      alert(`❌ Error in offramp transfer: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <MdPending className="text-yellow-500" size={20} />;
      case 'none':
        return <MdError className="text-gray-400" size={20} />;
      default:
        return <MdError className="text-red-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Treasury Payment Management</h2>
            <p className="text-green-100">Manage batch payments, buyer transactions, and offramp transfers</p>
          </div>
          <MdAccountBalance size={48} className="text-green-200" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('set-payment')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'set-payment'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdAdd className="inline mr-2" />
          Set Payment
        </button>
        <button
          onClick={() => setActiveTab('pay-batch')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'pay-batch'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdPayment className="inline mr-2" />
          Pay for Batch
        </button>
        <button
          onClick={() => setActiveTab('offramp-transfer')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'offramp-transfer'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MdSwapHoriz className="inline mr-2" />
          Offramp Transfer
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        {activeTab === 'set-payment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Set Payment Requirement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Batch</option>
                  {payments.map((payment) => (
                    <option key={payment.batchId} value={payment.batchId}>
                      Batch {payment.batchId} - {payment.batchInfo?.origin || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount in USDC"
                />
              </div>
            </div>
            <button
              onClick={handleSetPayment}
              disabled={loading || !selectedBatch || !paymentAmount}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting...' : 'Set Payment Requirement'}
            </button>
          </div>
        )}

        {activeTab === 'pay-batch' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Pay for Batch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Batch</option>
                  {payments.filter(p => p.paymentAmount && p.paymentAmount > 0).map((payment) => (
                    <option key={payment.batchId} value={payment.batchId}>
                      Batch {payment.batchId} - {payment.paymentAmount} USDC
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter payment amount"
                />
              </div>
            </div>
            <button
              onClick={handlePayForBatch}
              disabled={loading || !selectedBatch || !paymentAmount}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Payment...' : 'Pay for Batch'}
            </button>
          </div>
        )}

        {activeTab === 'offramp-transfer' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Offramp Transfer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Batch</option>
                  {payments.filter(p => p.isPaid).map((payment) => (
                    <option key={payment.batchId} value={payment.batchId}>
                      Batch {payment.batchId} - Paid: {payment.paymentAmount} USDC
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Transfer amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer Address
                </label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offramp Partner Address
                </label>
                <input
                  type="text"
                  value={offrampAddress}
                  onChange={(e) => setOfframpAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0x..."
                />
              </div>
            </div>
            <button
              onClick={handleOfframpTransfer}
              disabled={loading || !selectedBatch || !buyerAddress || !offrampAddress || !paymentAmount}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Transfer...' : 'Execute Offramp Transfer'}
            </button>
          </div>
        )}
      </div>

      {/* Payment Status Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Status Overview</h3>
          <button
            onClick={loadPaymentData}
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
                <th className="text-left py-2">Batch ID</th>
                <th className="text-left py-2">Origin</th>
                <th className="text-left py-2">Payment Required</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.batchId} className="border-b border-gray-100">
                  <td className="py-2 font-mono">{payment.batchId}</td>
                  <td className="py-2">{payment.batchInfo?.origin || 'Unknown'}</td>
                  <td className="py-2">
                    {payment.paymentAmount ? `${payment.paymentAmount} USDC` : 'Not set'}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.paymentStatus || 'none')}
                      <span className="capitalize">{payment.paymentStatus || 'none'}</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex space-x-2">
                      {!payment.paymentAmount && (
                        <button
                          onClick={() => {
                            setSelectedBatch(payment.batchId);
                            setActiveTab('set-payment');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Set Payment
                        </button>
                      )}
                      {payment.paymentAmount && !payment.isPaid && (
                        <button
                          onClick={() => {
                            setSelectedBatch(payment.batchId);
                            setPaymentAmount(payment.paymentAmount?.toString() || '');
                            setActiveTab('pay-batch');
                          }}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Pay
                        </button>
                      )}
                      {payment.isPaid && (
                        <button
                          onClick={() => {
                            setSelectedBatch(payment.batchId);
                            setPaymentAmount(payment.paymentAmount?.toString() || '');
                            setActiveTab('offramp-transfer');
                          }}
                          className="text-purple-600 hover:text-purple-800 text-xs"
                        >
                          Transfer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}