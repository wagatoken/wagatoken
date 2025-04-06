"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Loader2, Check, LinkIcon, ExternalLink, MapPin, Truck, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function TokenRedemptionStep() {
  const { mintedTokens, redemptionRequests, redeemTokens } = useDemoContext()
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [redeemQuantity, setRedeemQuantity] = useState(1)
  const [shippingAddress, setShippingAddress] = useState("")

  const handleRedeem = async () => {
    if (selectedTokenId === null || !shippingAddress) return

    setIsRedeeming(true)
    await redeemTokens(selectedTokenId, redeemQuantity, shippingAddress)
    setIsRedeeming(false)
    setShippingAddress("")
  }

  // Filter tokens that can be redeemed (quantity > 0)
  const redeemableTokens = mintedTokens.filter((token) => token.quantity > 0)

  // Get the selected token
  const selectedToken = selectedTokenId !== null ? mintedTokens.find((t) => t.tokenId === selectedTokenId) : null

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="purple" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-900/40 p-3 rounded-full mr-3">
            <ShoppingBag className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="hero-gradient-text">Step 7: Token Redemption</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          The final step in the WAGA Protocol workflow is token redemption. Token holders can redeem their tokens for
          physical coffee, triggering a fulfillment process that delivers the product to the specified address. This
          completes the cycle from digital back to physical, ensuring that tokens maintain their real-world value.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-4">Redeem Coffee Tokens</h3>

            {redeemableTokens.length === 0 ? (
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No tokens available for redemption</p>
                <p className="text-sm text-gray-500 mt-2">Mint tokens in Step 3 to proceed with redemption</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-3">Select a Token to Redeem</h4>
                  <div className="space-y-2">
                    {redeemableTokens.map((token) => (
                      <div
                        key={token.id}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors",
                          selectedTokenId === token.tokenId
                            ? "bg-purple-900/30 border border-purple-500/50"
                            : "bg-black/20 border border-purple-500/10 hover:border-purple-500/30",
                        )}
                        onClick={() => {
                          setSelectedTokenId(token.tokenId)
                          setRedeemQuantity(1) // Reset quantity when selecting a new token
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-purple-900/30 p-2 rounded-lg mr-3">
                              <Coins className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-200">Token #{token.tokenId}</h5>
                              <p className="text-xs text-gray-400">Available: {token.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedToken && (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-purple-300 mb-3">Redemption Details</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="redeemQuantity">Quantity to Redeem</Label>
                        <Input
                          id="redeemQuantity"
                          type="number"
                          value={redeemQuantity}
                          onChange={(e) => setRedeemQuantity(Number.parseInt(e.target.value))}
                          className="bg-black/30 border-purple-500/30 mt-1"
                          min="1"
                          max={selectedToken.quantity}
                        />
                      </div>

                      <div>
                        <Label htmlFor="shippingAddress">Shipping Address</Label>
                        <Textarea
                          id="shippingAddress"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="bg-black/30 border-purple-500/30 mt-1"
                          placeholder="Enter your full shipping address"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-emerald-600"
                  disabled={selectedTokenId === null || !shippingAddress || isRedeeming}
                  onClick={handleRedeem}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Redemption...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Redeem Tokens
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-4">Redemption Requests</h3>
            {redemptionRequests.length === 0 ? (
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No redemption requests yet</p>
                <p className="text-sm text-gray-500 mt-2">Redeem tokens to see your requests here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {redemptionRequests.map((request) => {
                  const token = mintedTokens.find((t) => t.tokenId === request.tokenId)
                  return (
                    <div
                      key={request.id}
                      className="bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-purple-300">Redemption #{request.id.split("-")[1]}</h4>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs border flex items-center",
                            request.status === "pending"
                              ? "bg-amber-900/30 text-amber-300 border-amber-500/30"
                              : request.status === "processing"
                                ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                                : request.status === "shipped"
                                  ? "bg-blue-900/30 text-blue-300 border-blue-500/30"
                                  : "bg-green-900/30 text-green-300 border-green-500/30",
                          )}
                        >
                          {request.status === "pending" && (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Pending
                            </>
                          )}
                          {request.status === "processing" && (
                            <>
                              <Check className="h-3 w-3 mr-1" /> Processing
                            </>
                          )}
                          {request.status === "shipped" && (
                            <>
                              <Truck className="h-3 w-3 mr-1" /> Shipped
                            </>
                          )}
                          {request.status === "completed" && (
                            <>
                              <Check className="h-3 w-3 mr-1" /> Completed
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">
                        Token: <span className="text-gray-300 font-mono">#{request.tokenId}</span> • Quantity:{" "}
                        <span className="text-gray-300">{request.quantity}</span>
                      </p>

                      <div className="mt-3 pt-3 border-t border-purple-500/10">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="text-sm font-medium text-purple-300 mb-1">Shipping Address</h5>
                            <p className="text-xs text-gray-400">{request.shippingAddress}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-purple-500/10 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {request.status === "pending"
                            ? "Awaiting processing"
                            : request.status === "processing"
                              ? "Being prepared for shipment"
                              : request.status === "shipped"
                                ? "In transit to destination"
                                : "Delivery completed"}
                        </span>
                        <a
                          href="#"
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                          onClick={(e) => e.preventDefault()}
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <span className="font-mono">{request.txHash.substring(0, 10)}...</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DynamicGlowCard>

      <DynamicGlowCard variant="emerald" className="p-6">
        <h3 className="text-lg font-medium text-emerald-300 mb-4">The Redemption Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">1. Redemption Request</h4>
            <p className="text-sm text-gray-400">
              Token holders submit a redemption request, specifying the quantity and shipping address.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">2. Token Burning</h4>
            <p className="text-sm text-gray-400">
              The specified tokens are burned (removed from circulation) to prevent double-spending.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">3. Fulfillment</h4>
            <p className="text-sm text-gray-400">
              The physical coffee is prepared, packaged, and shipped to the specified address.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">4. Delivery Confirmation</h4>
            <p className="text-sm text-gray-400">
              Upon delivery, the redemption process is marked as complete on the blockchain.
            </p>
          </div>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

