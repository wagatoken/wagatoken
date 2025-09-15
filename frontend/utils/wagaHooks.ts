import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi'
import { wagaContracts } from './wagmi'
import { 
  WAGACoffeeTokenCoreABI, 
  WAGATreasuryABI, 
  WAGACoffeeRedemptionABI, 
  WAGAInventoryManagerMVPABI 
} from './contractABIs'
import { BatchInfo, RedemptionRequest, PaymentInfo } from './contracts'
import { useMemo } from 'react'

// Coffee Token Core Hooks
export function useGetBatchInfo(batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.coffeeTokenCore,
    abi: WAGACoffeeTokenCoreABI,
    functionName: 'getBatchInfo',
    args: batchId !== undefined ? [batchId] : undefined,
    query: {
      enabled: batchId !== undefined,
    },
  })
}

export function useGetActiveBatches() {
  return useReadContract({
    ...wagaContracts.coffeeTokenCore,
    abi: WAGACoffeeTokenCoreABI,
    functionName: 'getActiveBatchIds',
  })
}

export function useGetUserBalance(userAddress: `0x${string}` | undefined, batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.coffeeTokenCore,
    abi: WAGACoffeeTokenCoreABI,
    functionName: 'balanceOf',
    args: userAddress && batchId !== undefined ? [userAddress, batchId] : undefined,
    query: {
      enabled: !!userAddress && batchId !== undefined,
    },
  })
}

export function useCreateBatch() {
  return useWriteContract()
}

export function useMintBatch() {
  return useWriteContract()
}

// Treasury Hooks
export function useCheckPaymentStatus(userAddress: `0x${string}` | undefined, batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.treasury,
    abi: WAGATreasuryABI,
    functionName: 'checkPaymentStatus',
    args: userAddress && batchId !== undefined ? [userAddress, batchId] : undefined,
    query: {
      enabled: !!userAddress && batchId !== undefined,
    },
  })
}

export function useGetBatchPaymentInfo(batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.treasury,
    abi: WAGATreasuryABI,
    functionName: 'getBatchPaymentInfo',
    args: batchId !== undefined ? [batchId] : undefined,
    query: {
      enabled: batchId !== undefined,
    },
  })
}

export function useGetTreasuryStats() {
  return useReadContract({
    ...wagaContracts.treasury,
    abi: WAGATreasuryABI,
    functionName: 'getTreasuryStats',
  })
}

export function usePayForBatch() {
  return useWriteContract()
}

// Redemption Hooks
export function useGetRedemptionDetails(redemptionId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.redemption,
    abi: WAGACoffeeRedemptionABI,
    functionName: 'getRedemptionDetails',
    args: redemptionId !== undefined ? [redemptionId] : undefined,
    query: {
      enabled: redemptionId !== undefined,
    },
  })
}

export function useGetConsumerRedemptions(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    ...wagaContracts.redemption,
    abi: WAGACoffeeRedemptionABI,
    functionName: 'getConsumerRedemptions',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

export function useRequestRedemption() {
  return useWriteContract()
}

// Inventory Manager Hooks
export function useGetBatchStatus(batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.inventoryManager,
    abi: WAGAInventoryManagerMVPABI,
    functionName: 'getBatchStatus',
    args: batchId !== undefined ? [batchId] : undefined,
    query: {
      enabled: batchId !== undefined,
    },
  })
}

export function useNeedsVerification(batchId: bigint | undefined) {
  return useReadContract({
    ...wagaContracts.inventoryManager,
    abi: WAGAInventoryManagerMVPABI,
    functionName: 'needsVerification',
    args: batchId !== undefined ? [batchId] : undefined,
    query: {
      enabled: batchId !== undefined,
    },
  })
}

// Event Watching Hooks
export function useWatchBatchCreated(onBatchCreated?: (log: any) => void) {
  return useWatchContractEvent({
    ...wagaContracts.coffeeTokenCore,
    abi: WAGACoffeeTokenCoreABI,
    eventName: 'BatchCreated',
    onLogs: onBatchCreated,
  })
}

export function useWatchRedemptionRequested(onRedemptionRequested?: (log: any) => void) {
  return useWatchContractEvent({
    ...wagaContracts.redemption,
    abi: WAGACoffeeRedemptionABI,
    eventName: 'RedemptionRequested',
    onLogs: onRedemptionRequested,
  })
}

export function useWatchPaymentReceived(onPaymentReceived?: (log: any) => void) {
  return useWatchContractEvent({
    ...wagaContracts.treasury,
    abi: WAGATreasuryABI,
    eventName: 'PaymentReceived',
    onLogs: onPaymentReceived,
  })
}

// Utility Hooks
export function useFormattedBatchInfo(batchId: bigint | undefined) {
  const { data: batchInfo, ...rest } = useGetBatchInfo(batchId)
  
  return useMemo(() => {
    if (!batchInfo) return { data: null, ...rest }
    
    const [
      productionDate,
      expiryDate,
      isVerified,
      quantity,
      pricePerUnit,
      packagingInfo,
      metadataHash,
      isMetadataVerified,
      lastVerifiedTimestamp
    ] = batchInfo
    
    const formatted: BatchInfo = {
      productionDate,
      expiryDate,
      isVerified,
      quantity,
      pricePerUnit,
      packagingInfo,
      metadataHash,
      isMetadataVerified,
      lastVerifiedTimestamp
    }
    
    return { data: formatted, ...rest }
  }, [batchInfo, rest])
}

export function useFormattedPaymentInfo(batchId: bigint | undefined) {
  const { data: paymentData, ...rest } = useGetBatchPaymentInfo(batchId)
  
  return useMemo(() => {
    if (!paymentData) return { data: null, ...rest }
    
    const [required, collected] = paymentData
    const formatted: PaymentInfo = { required, collected }
    
    return { data: formatted, ...rest }
  }, [paymentData, rest])
}

// Batch utility functions
export function formatPrice(priceWei: bigint): string {
  // Assuming price is in wei, convert to USD with 6 decimals for USDC
  const price = Number(priceWei) / 1e18 // Convert from wei to ETH equivalent
  return price.toFixed(6)
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString()
}

export function formatQuantity(quantity: bigint): number {
  return Number(quantity)
}

export function getRedemptionStatusText(status: number): string {
  switch (status) {
    case 0: return 'Requested'
    case 1: return 'Processing'
    case 2: return 'Fulfilled'
    case 3: return 'Cancelled'
    default: return 'Unknown'
  }
}

export function isExpired(expiryDate: bigint): boolean {
  return Date.now() / 1000 > Number(expiryDate)
}

export function isVerified(batchInfo: BatchInfo): boolean {
  return batchInfo.isVerified && batchInfo.isMetadataVerified
}
