"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Types for our demo data
export type CoffeeBatch = {
  id: string
  producer: string
  origin: string
  variety: string
  altitude: string
  process: string
  roastProfile: string // Added for retail focus
  harvestDate: string
  quantity: number
  packagingInfo: string // Now represents retail bag size (250g, 500g, etc.)
  pricePerUnit: number
  metadataHash: string
  qrCodeUrl: string // Added for QR code traceability
  status: "created" | "verified" | "tokenized" | "distributed" | "redeemed"
  createdAt: string
}

export type VerificationRequest = {
  id: string
  batchId: string
  status: "pending" | "completed" | "failed"
  oracleData: {
    warehouseId: string
    inspectorId: string
    timestamp: string
    quantityVerified: number
    qualityScore: number
  }
  txHash: string
}

export type MintedToken = {
  id: string
  batchId: string
  tokenId: number
  quantity: number
  owner: string
  metadataURI: string
  txHash: string
}

export type RedemptionRequest = {
  id: string
  tokenId: number
  quantity: number
  shippingAddress: string
  status: "pending" | "processing" | "shipped" | "completed"
  trackingNumber?: string // Added for 3PL integration
  estimatedDelivery?: string // Added for 3PL integration
  logisticsProvider?: string // Added for 3PL integration
  txHash: string
}

// New types for community distribution and 3PL integration
export type Distributor = {
  id: string
  name: string
  location: string
  stakingAmount: number
  discountRate: number
  inventory: {
    tokenId: number
    quantity: number
  }[]
  status: "active" | "pending"
  joinedAt: string
}

export type LogisticsProvider = {
  id: string
  name: string
  regions: string[]
  trackingUrl: string
  integrationStatus: "active" | "pending"
}

export type DistributionOrder = {
  id: string
  distributorId: string
  tokenIds: number[]
  quantities: number[]
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
  trackingInfo?: {
    provider: string
    trackingNumber: string
    estimatedDelivery: string
  }
}

// Demo context type
type DemoContextType = {
  currentStep: number
  totalSteps: number
  batches: CoffeeBatch[]
  verificationRequests: VerificationRequest[]
  mintedTokens: MintedToken[]
  redemptionRequests: RedemptionRequest[]
  distributors: Distributor[] // New for community distribution
  logisticsProviders: LogisticsProvider[] // New for 3PL integration
  distributionOrders: DistributionOrder[] // New for tracking distribution
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (step: number) => void
  isStepComplete: (step: number) => boolean // Added this function
  markStepComplete: (step: number) => void // Added this function
  createBatch: (batchData: Partial<CoffeeBatch>) => Promise<CoffeeBatch>
  verifyBatch: (batchId: string) => Promise<VerificationRequest>
  mintTokens: (batchId: string, quantity: number) => Promise<MintedToken>
  redeemTokens: (tokenId: number, quantity: number, shippingAddress: string) => Promise<RedemptionRequest>
  // New functions for community distribution and 3PL integration
  registerDistributor: (distributorData: Partial<Distributor>) => Promise<Distributor>
  stakeTokens: (distributorId: string, amount: number) => Promise<Distributor>
  createDistributionOrder: (
    distributorId: string,
    tokenIds: number[],
    quantities: number[],
  ) => Promise<DistributionOrder>
  updateOrderStatus: (orderId: string, status: DistributionOrder["status"]) => Promise<DistributionOrder>
  getQRCodeData: (qrCodeUrl: string) => Promise<any>
}

// Create the context
const DemoContext = createContext<DemoContextType | undefined>(undefined)

// Provider component
export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 8 // Updated total number of steps in our demo
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set()) // Added this state

  // Demo state
  const [batches, setBatches] = useState<CoffeeBatch[]>([])
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [mintedTokens, setMintedTokens] = useState<MintedToken[]>([])
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [logisticsProviders, setLogisticsProviders] = useState<LogisticsProvider[]>([
    {
      id: "3pl-1",
      name: "Global Express Logistics",
      regions: ["North America", "Europe", "Asia"],
      trackingUrl: "https://track.globalexpress.com/",
      integrationStatus: "active",
    },
    {
      id: "3pl-2",
      name: "EcoShip Fulfillment",
      regions: ["Africa", "South America", "Oceania"],
      trackingUrl: "https://ecoship.com/track/",
      integrationStatus: "active",
    },
    {
      id: "3pl-3",
      name: "CoffeeRoute Logistics",
      regions: ["Europe", "Middle East", "Africa"],
      trackingUrl: "https://track.coffeeroute.com/",
      integrationStatus: "pending",
    },
  ])
  const [distributionOrders, setDistributionOrders] = useState<DistributionOrder[]>([])

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      markStepComplete(currentStep) // Mark current step as complete
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, totalSteps])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step)
      }
    },
    [totalSteps],
  )

  // Step completion functions
  const isStepComplete = useCallback(
    (step: number) => {
      return completedSteps.has(step)
    },
    [completedSteps],
  )

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev)
      newSet.add(step)
      return newSet
    })
  }, [])

  // Simulate blockchain transaction
  const simulateBlockchainTransaction = useCallback(() => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        // Generate fake transaction hash
        const txHash = "0x" + Math.random().toString(16).substring(2, 42)
        resolve(txHash)
      }, 2000) // Simulate blockchain delay
    })
  }, [])

  // Generate QR code URL
  const generateQRCodeUrl = useCallback((batchId: string) => {
    return `https://waga.protocol/verify/${batchId}`
  }, [])

  // Demo action functions
  const createBatch = useCallback(
    async (batchData: Partial<CoffeeBatch>): Promise<CoffeeBatch> => {
      const txHash = await simulateBlockchainTransaction()
      const batchId = `BATCH-${Math.floor(Math.random() * 10000)}`
      const qrCodeUrl = generateQRCodeUrl(batchId)

      const newBatch: CoffeeBatch = {
        id: batchId,
        producer: batchData.producer || "Yirgacheffe Cooperative",
        origin: batchData.origin || "Ethiopia",
        variety: batchData.variety || "Heirloom",
        altitude: batchData.altitude || "1,800-2,200 masl",
        process: batchData.process || "Washed",
        roastProfile: batchData.roastProfile || "Medium",
        harvestDate: batchData.harvestDate || new Date().toISOString().split("T")[0],
        quantity: batchData.quantity || 1000, // Now represents number of retail bags
        packagingInfo: batchData.packagingInfo || "250g",
        pricePerUnit: batchData.pricePerUnit || 12.99, // Price per retail bag
        metadataHash: batchData.metadataHash || `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`,
        qrCodeUrl: qrCodeUrl,
        status: "created",
        createdAt: new Date().toISOString(),
      }

      setBatches((prev) => [...prev, newBatch])
      markStepComplete(1) // Mark batch creation step as complete
      return newBatch
    },
    [simulateBlockchainTransaction, generateQRCodeUrl, markStepComplete],
  )

  const verifyBatch = useCallback(
    async (batchId: string): Promise<VerificationRequest> => {
      const txHash = await simulateBlockchainTransaction()

      const newVerification: VerificationRequest = {
        id: `VER-${Math.floor(Math.random() * 10000)}`,
        batchId,
        status: "pending",
        oracleData: {
          warehouseId: `WH-${Math.floor(Math.random() * 100)}`,
          inspectorId: `INSP-${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
          quantityVerified: 1000,
          qualityScore: 92,
        },
        txHash,
      }

      setVerificationRequests((prev) => [...prev, newVerification])

      // Simulate verification completion after delay
      setTimeout(() => {
        setVerificationRequests((prev) =>
          prev.map((req) =>
            req.id === newVerification.id
              ? {
                  ...req,
                  status: "completed",
                }
              : req,
          ),
        )

        // Update batch status
        setBatches((prev) =>
          prev.map((batch) =>
            batch.id === batchId
              ? {
                  ...batch,
                  status: "verified",
                }
              : batch,
          ),
        )

        markStepComplete(2) // Mark verification step as complete
      }, 5000)

      return newVerification
    },
    [simulateBlockchainTransaction, markStepComplete],
  )

  const mintTokens = useCallback(
    async (batchId: string, quantity: number): Promise<MintedToken> => {
      const txHash = await simulateBlockchainTransaction()

      const newToken: MintedToken = {
        id: `TOKEN-${Math.floor(Math.random() * 10000)}`,
        batchId,
        tokenId: Math.floor(Math.random() * 1000000),
        quantity,
        owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        metadataURI: `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`,
        txHash,
      }

      setMintedTokens((prev) => [...prev, newToken])

      // Update batch status
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === batchId
            ? {
                ...batch,
                status: "tokenized",
              }
            : batch,
        ),
      )

      markStepComplete(3) // Mark token minting step as complete
      return newToken
    },
    [simulateBlockchainTransaction, markStepComplete],
  )

  const redeemTokens = useCallback(
    async (tokenId: number, quantity: number, shippingAddress: string): Promise<RedemptionRequest> => {
      const txHash = await simulateBlockchainTransaction()

      // Randomly select a logistics provider
      const provider = logisticsProviders[Math.floor(Math.random() * logisticsProviders.length)]

      // Generate a random tracking number
      const trackingNumber = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`

      // Generate estimated delivery date (7-14 days from now)
      const deliveryDays = Math.floor(Math.random() * 7) + 7
      const estimatedDelivery = new Date()
      estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays)

      const newRedemption: RedemptionRequest = {
        id: `REDEEM-${Math.floor(Math.random() * 10000)}`,
        tokenId,
        quantity,
        shippingAddress,
        status: "pending",
        trackingNumber: trackingNumber,
        estimatedDelivery: estimatedDelivery.toISOString().split("T")[0],
        logisticsProvider: provider.name,
        txHash,
      }

      setRedemptionRequests((prev) => [...prev, newRedemption])

      // Simulate redemption processing after delay
      setTimeout(() => {
        setRedemptionRequests((prev) =>
          prev.map((req) =>
            req.id === newRedemption.id
              ? {
                  ...req,
                  status: "processing",
                }
              : req,
          ),
        )

        // Update token quantity
        setMintedTokens((prev) =>
          prev.map((token) =>
            token.tokenId === tokenId
              ? {
                  ...token,
                  quantity: token.quantity - quantity,
                }
              : token,
          ),
        )

        // Find the batch associated with this token
        const token = mintedTokens.find((t) => t.tokenId === tokenId)
        if (token) {
          // Update batch status if all tokens are redeemed
          const remainingTokens = token.quantity - quantity
          if (remainingTokens <= 0) {
            setBatches((prev) =>
              prev.map((batch) =>
                batch.id === token.batchId
                  ? {
                      ...batch,
                      status: "redeemed",
                    }
                  : batch,
              ),
            )
          }
        }

        markStepComplete(6) // Mark token redemption step as complete
      }, 3000)

      return newRedemption
    },
    [logisticsProviders, mintedTokens, simulateBlockchainTransaction, markStepComplete],
  )

  // New functions for community distribution
  const registerDistributor = useCallback(
    async (distributorData: Partial<Distributor>): Promise<Distributor> => {
      await simulateBlockchainTransaction()

      const newDistributor: Distributor = {
        id: `DIST-${Math.floor(Math.random() * 10000)}`,
        name: distributorData.name || "New Distributor",
        location: distributorData.location || "Unknown",
        stakingAmount: distributorData.stakingAmount || 0,
        discountRate: distributorData.stakingAmount ? (distributorData.stakingAmount / 1000) * 5 : 0, // 5% discount per 1000 tokens staked
        inventory: [],
        status: "pending",
        joinedAt: new Date().toISOString(),
      }

      setDistributors((prev) => [...prev, newDistributor])

      // Simulate activation after delay
      if (newDistributor.stakingAmount > 0) {
        setTimeout(() => {
          setDistributors((prev) =>
            prev.map((dist) =>
              dist.id === newDistributor.id
                ? {
                    ...dist,
                    status: "active",
                  }
                : dist,
            ),
          )
        }, 3000)
      }

      markStepComplete(4) // Mark community distribution step as complete
      return newDistributor
    },
    [simulateBlockchainTransaction, markStepComplete],
  )

  const stakeTokens = useCallback(
    async (distributorId: string, amount: number): Promise<Distributor> => {
      await simulateBlockchainTransaction()

      const updatedDistributors = distributors.map((dist) => {
        if (dist.id === distributorId) {
          const newStakingAmount = dist.stakingAmount + amount
          const newDiscountRate = (newStakingAmount / 1000) * 5 // 5% discount per 1000 tokens staked
          return {
            ...dist,
            stakingAmount: newStakingAmount,
            discountRate: newDiscountRate,
            status: "active",
          }
        }
        return dist
      })

      setDistributors(updatedDistributors)
      return updatedDistributors.find((d) => d.id === distributorId) as Distributor
    },
    [distributors, simulateBlockchainTransaction],
  )

  const createDistributionOrder = useCallback(
    async (distributorId: string, tokenIds: number[], quantities: number[]): Promise<DistributionOrder> => {
      await simulateBlockchainTransaction()

      const newOrder: DistributionOrder = {
        id: `ORDER-${Math.floor(Math.random() * 10000)}`,
        distributorId,
        tokenIds,
        quantities,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      setDistributionOrders((prev) => [...prev, newOrder])

      // Update distributor inventory
      setDistributors((prev) =>
        prev.map((dist) => {
          if (dist.id === distributorId) {
            const updatedInventory = [...dist.inventory]

            tokenIds.forEach((tokenId, index) => {
              const existingItem = updatedInventory.findIndex((item) => item.tokenId === tokenId)

              if (existingItem >= 0) {
                updatedInventory[existingItem].quantity += quantities[index]
              } else {
                updatedInventory.push({
                  tokenId,
                  quantity: quantities[index],
                })
              }
            })

            return {
              ...dist,
              inventory: updatedInventory,
            }
          }
          return dist
        }),
      )

      // Update token quantities
      setMintedTokens((prev) =>
        prev.map((token) => {
          const index = tokenIds.indexOf(token.tokenId)
          if (index >= 0) {
            return {
              ...token,
              quantity: token.quantity - quantities[index],
            }
          }
          return token
        }),
      )

      // Simulate order processing
      setTimeout(() => {
        updateOrderStatus(newOrder.id, "processing")
      }, 2000)

      markStepComplete(5) // Mark inventory management step as complete
      return newOrder
    },
    [simulateBlockchainTransaction, markStepComplete],
  )

  const updateOrderStatus = useCallback(
    async (orderId: string, status: DistributionOrder["status"]): Promise<DistributionOrder> => {
      await simulateBlockchainTransaction()

      const updatedOrders = distributionOrders.map((order) => {
        if (order.id === orderId) {
          const updates: Partial<DistributionOrder> = { status }

          if (status === "shipped") {
            // Randomly select a logistics provider
            const provider = logisticsProviders[Math.floor(Math.random() * logisticsProviders.length)]

            // Generate tracking info
            updates.shippedAt = new Date().toISOString()
            updates.trackingInfo = {
              provider: provider.name,
              trackingNumber: `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
              estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }
          }

          if (status === "delivered") {
            updates.deliveredAt = new Date().toISOString()
          }

          return { ...order, ...updates }
        }
        return order
      })

      setDistributionOrders(updatedOrders)

      // If the order is shipped, simulate delivery after a delay
      if (status === "shipped") {
        setTimeout(() => {
          updateOrderStatus(orderId, "delivered")
        }, 5000)
      }

      return updatedOrders.find((o) => o.id === orderId) as DistributionOrder
    },
    [distributionOrders, logisticsProviders, simulateBlockchainTransaction],
  )

  // Function to simulate QR code scanning
  const getQRCodeData = useCallback(
    async (qrCodeUrl: string): Promise<any> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Find the batch associated with this QR code
      const batch = batches.find((b) => b.qrCodeUrl === qrCodeUrl)

      if (!batch) {
        throw new Error("Invalid QR code")
      }

      // Get verification data
      const verification = verificationRequests.find((v) => v.batchId === batch.id && v.status === "completed")

      // Get token data
      const token = mintedTokens.find((t) => t.batchId === batch.id)

      markStepComplete(7) // Mark QR traceability step as complete
      return {
        batch,
        verification,
        token,
        timestamp: new Date().toISOString(),
        blockchainVerified: true,
      }
    },
    [batches, mintedTokens, verificationRequests, markStepComplete],
  )

  const value = {
    currentStep,
    totalSteps,
    batches,
    verificationRequests,
    mintedTokens,
    redemptionRequests,
    distributors,
    logisticsProviders,
    distributionOrders,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isStepComplete, // Added this function
    markStepComplete, // Added this function
    createBatch,
    verifyBatch,
    mintTokens,
    redeemTokens,
    registerDistributor,
    stakeTokens,
    createDistributionOrder,
    updateOrderStatus,
    getQRCodeData,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

// Hook to use the demo context
export function useDemoContext() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error("useDemoContext must be used within a DemoProvider")
  }
  return context
}

