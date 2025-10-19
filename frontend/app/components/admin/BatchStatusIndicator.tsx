'use client';

import { MdWarning, MdError, MdSchedule, MdInfo } from 'react-icons/md';

interface BatchStatusIndicatorProps {
  batchId: string;
  expiryDate?: number;
  quantity?: number;
  lastVerified?: number;
  isVerified?: boolean;
  className?: string;
}

export default function BatchStatusIndicator({ 
  batchId, 
  expiryDate, 
  quantity = 0, 
  lastVerified,
  isVerified = false,
  className = "" 
}: BatchStatusIndicatorProps) {
  const now = Date.now() / 1000; // Convert to seconds
  const sevenDaysInSeconds = 7 * 24 * 60 * 60;
  const lowInventoryThreshold = 10; // This could be configurable

  // Check expiry status
  const isExpired = expiryDate ? now > expiryDate : false;
  const isExpiringSoon = expiryDate ? (expiryDate - now) < sevenDaysInSeconds && !isExpired : false;
  
  // Check inventory status
  const isLowInventory = quantity > 0 && quantity <= lowInventoryThreshold;
  
  // Check verification status
  const needsVerification = lastVerified ? (now - lastVerified) > sevenDaysInSeconds : true;

  // Determine priority status (highest priority first)
  let status: 'expired' | 'expiring' | 'low-inventory' | 'needs-verification' | 'healthy' = 'healthy';
  let statusText = '';
  let statusIcon = null;
  let statusColor = '';

  if (isExpired) {
    status = 'expired';
    statusText = 'Expired';
    statusIcon = <MdError size={16} />;
    statusColor = 'text-red-600 bg-red-50 border-red-200';
  } else if (isExpiringSoon) {
    status = 'expiring';
    statusText = 'Expiring Soon';
    statusIcon = <MdWarning size={16} />;
    statusColor = 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (isLowInventory) {
    status = 'low-inventory';
    statusText = 'Low Stock';
    statusIcon = <MdWarning size={16} />;
    statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (needsVerification) {
    status = 'needs-verification';
    statusText = 'Needs Verification';
    statusIcon = <MdSchedule size={16} />;
    statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
  }

  // Helper function to format days
  const formatDaysUntilExpiry = (expiryTimestamp: number) => {
    const daysUntil = Math.ceil((expiryTimestamp - now) / (24 * 60 * 60));
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `${daysUntil} days`;
  };

  if (status === 'healthy') {
    return null; // Don't show indicator for healthy batches to reduce clutter
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${statusColor} ${className}`}>
      {statusIcon}
      <span>{statusText}</span>
      {expiryDate && (status === 'expired' || status === 'expiring') && (
        <>
          <span>•</span>
          <span>{formatDaysUntilExpiry(expiryDate)}</span>
        </>
      )}
      {isLowInventory && (
        <>
          <span>•</span>
          <span>{quantity} left</span>
        </>
      )}
    </div>
  );
}

// Component for batch list items that includes status indicators
export function EnhancedBatchListItem({ 
  batch, 
  onSelect, 
  isSelected = false,
  children 
}: {
  batch: any;
  onSelect?: () => void;
  isSelected?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div 
      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">Batch #{batch.batchId}</h3>
            <BatchStatusIndicator
              batchId={batch.batchId}
              expiryDate={batch.expiryDate}
              quantity={batch.quantity}
              lastVerified={batch.lastVerified}
              isVerified={batch.isVerified}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Quantity:</span> {batch.quantity}
            </div>
            <div>
              <span className="font-medium">Price:</span> ${batch.pricePerUnit}
            </div>
            {batch.expiryDate && (
              <div>
                <span className="font-medium">Expires:</span> {new Date(batch.expiryDate * 1000).toLocaleDateString()}
              </div>
            )}
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 ${batch.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {batch.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}