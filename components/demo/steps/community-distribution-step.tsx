"use client"

import { useState } from "react"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"
import { Users, Loader2, Check, MapPin, Coins, Package, ArrowRight, Coffee, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function CommunityDistributionStep() {
  const { mintedTokens, distributors, distributionOrders, registerDistributor, stakeTokens, createDistributionOrder } =
    useDemoContext()

  const [activeTab, setActiveTab] = useState("distributors")
  const [isRegistering, setIsRegistering] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [selectedDistributorId, setSelectedDistributorId] = useState("")
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)
  const [orderQuantity, setOrderQuantity] = useState(10)

  const [distributorData, setDistributorData] = useState({
    name: "",
    location: "",
    stakingAmount: 1000,
  })

  const [stakingData, setStakingData] = useState({
    amount: 500,
  })

  const handleDistributorInputChange = (e) => {
    const { name, value } = e.target
    setDistributorData((prev) => ({
      ...prev,
      [name]: name === "stakingAmount" ? Number.parseFloat(value) : value,
    }))
  }

  const handleStakingInputChange = (e) => {
    const { name, value } = e.target
    setStakingData((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value),
    }))
  }

  const handleRegisterDistributor = async (e) => {
    e.preventDefault()
    setIsRegistering(true)
    await registerDistributor(distributorData)
    setIsRegistering(false)
    setDistributorData({
      name: "",
      location: "",
      stakingAmount: 1000,
    })
  }

  const handleStakeTokens = async (e) => {
    e.preventDefault()
    if (!selectedDistributorId) return

    setIsStaking(true)
    try {
      await stakeTokens(selectedDistributorId, stakingData.amount)
    } catch (error) {
      console.error("Error staking tokens:", error)
    } finally {
      setIsStaking(false)
      setStakingData({
        amount: 500,
      })
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (!selectedDistributorId || selectedTokenId === null) return

    setIsOrdering(true)
    try {
      await createDistributionOrder(selectedDistributorId, [selectedTokenId], [orderQuantity])
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsOrdering(false)
      setOrderQuantity(10)
    }
  }

  // Filter tokens that can be distributed (quantity > 0)
  const availableTokens = mintedTokens.filter((token) => token.quantity > 0)

  return (
    <div className="animate-in fade-in duration-700">
      <DynamicGlowCard variant="purple" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-900/40 p-3 rounded-full mr-3">
            <Users className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="web3-dual-gradient-text-glow">Step 4: Community Distribution</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          The Coffee Tokenization & Distribution workflow introduces a community-driven distribution model where
          individuals can become distributors by staking tokens. This approach creates a growing network that
          efficiently moves coffee from producers to consumers while providing economic opportunities for community
          members.
        </p>

        <Tabs defaultValue="distributors" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-purple-500/20 rounded-lg p-1">
            <TabsTrigger
              value="distributors"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Distributors
            </TabsTrigger>
            <TabsTrigger
              value="staking"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300"
            >
              <Coins className="h-4 w-4 mr-2" />
              Staking
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300"
            >
              <Package className="h-4 w-4 mr-2" />
              Distribution Orders
            </TabsTrigger>
          </TabsList>

          {/* Distributors Tab */}
          <TabsContent value="distributors">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Register as a Distributor</h3>
                <form onSubmit={handleRegisterDistributor} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Distributor Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={distributorData.name}
                        onChange={handleDistributorInputChange}
                        className="bg-black/30 border-purple-500/30 mt-1"
                        placeholder="Your business name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={distributorData.location}
                        onChange={handleDistributorInputChange}
                        className="bg-black/30 border-purple-500/30 mt-1"
                        placeholder="City, Country"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="stakingAmount">Initial Staking Amount</Label>
                      <Input
                        id="stakingAmount"
                        name="stakingAmount"
                        type="number"
                        value={distributorData.stakingAmount}
                        onChange={handleDistributorInputChange}
                        className="bg-black/30 border-purple-500/30 mt-1"
                        min="1000"
                        step="100"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 1000 tokens required. Higher stakes provide better discounts.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-emerald-600"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Register as Distributor
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Registered Distributors</h3>
                {distributors.length === 0 ? (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                    <Users className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                    <p className="text-gray-400">No distributors registered yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Register as a distributor to join the coffee distribution network
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {distributors.map((distributor) => (
                      <div
                        key={distributor.id}
                        className="bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-purple-300">{distributor.name}</h4>
                          <div
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs border flex items-center",
                              distributor.status === "active"
                                ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                                : "bg-amber-900/30 text-amber-300 border-amber-500/30",
                            )}
                          >
                            {distributor.status === "active" ? (
                              <>
                                <Check className="h-3 w-3 mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Pending
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-400 mb-3">
                          <MapPin className="h-4 w-4 mr-1 text-purple-400" />
                          <span>{distributor.location}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">Staked:</span>{" "}
                            <span className="text-gray-300">{distributor.stakingAmount} tokens</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Discount:</span>{" "}
                            <span className="text-gray-300">{distributor.discountRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Inventory:</span>{" "}
                            <span className="text-gray-300">
                              {distributor.inventory.reduce((sum, item) => sum + item.quantity, 0)} bags
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">ID:</span>{" "}
                            <span className="text-gray-300 font-mono">{distributor.id}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Staking Tab */}
          <TabsContent value="staking">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Stake Additional Tokens</h3>
                {distributors.length === 0 ? (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                    <Coins className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                    <p className="text-gray-400">No distributors available for staking</p>
                    <p className="text-sm text-gray-500 mt-2">Register as a distributor first to stake tokens</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-600 to-emerald-600"
                      onClick={() => setActiveTab("distributors")}
                    >
                      Register as Distributor
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleStakeTokens} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="distributorId">Select Distributor</Label>
                        <div className="space-y-2 mt-1">
                          {distributors.map((distributor) => (
                            <div
                              key={distributor.id}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                selectedDistributorId === distributor.id
                                  ? "bg-purple-900/30 border border-purple-500/50"
                                  : "bg-black/20 border border-purple-500/10 hover:border-purple-500/30",
                              )}
                              onClick={() => setSelectedDistributorId(distributor.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-200">{distributor.name}</h5>
                                  <p className="text-xs text-gray-400">
                                    Currently staked: {distributor.stakingAmount} tokens
                                  </p>
                                </div>
                                <div className="text-sm text-gray-300">
                                  {distributor.discountRate.toFixed(1)}% discount
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount to Stake</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          value={stakingData.amount}
                          onChange={handleStakingInputChange}
                          className="bg-black/30 border-purple-500/30 mt-1"
                          min="100"
                          step="100"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Staking more tokens increases your discount rate (5% per 1000 tokens)
                        </p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white"
                      disabled={!selectedDistributorId || isStaking}
                    >
                      {isStaking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Staking Tokens...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Stake Tokens
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Staking Benefits</h3>
                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-purple-300 mb-2">Discount Tiers</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">1,000 tokens</span>
                        <span className="text-sm font-medium text-gray-300">5% Discount</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">2,000 tokens</span>
                        <span className="text-sm font-medium text-gray-300">10% Discount</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">5,000 tokens</span>
                        <span className="text-sm font-medium text-gray-300">25% Discount</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-400">10,000 tokens</span>
                        <span className="text-sm font-medium text-gray-300">50% Discount</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-2">Additional Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Priority access to limited edition and seasonal coffee releases</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Earn commission on sales through your distribution network</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Voting rights on platform governance decisions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Access to exclusive distributor community and resources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Distribution Orders Tab */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Create Distribution Order</h3>
                {distributors.length === 0 || availableTokens.length === 0 ? (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                    <Package className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                    <p className="text-gray-400">
                      {distributors.length === 0
                        ? "No distributors available for ordering"
                        : "No tokens available for distribution"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {distributors.length === 0
                        ? "Register as a distributor first to create orders"
                        : "Mint tokens first to distribute them"}
                    </p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-600 to-emerald-600"
                      onClick={() => setActiveTab(distributors.length === 0 ? "distributors" : "tokens")}
                    >
                      {distributors.length === 0 ? "Register as Distributor" : "Mint Tokens"}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateOrder} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="distributorId">Select Distributor</Label>
                        <div className="space-y-2 mt-1">
                          {distributors.map((distributor) => (
                            <div
                              key={distributor.id}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                selectedDistributorId === distributor.id
                                  ? "bg-purple-900/30 border border-purple-500/50"
                                  : "bg-black/20 border border-purple-500/10 hover:border-purple-500/30",
                              )}
                              onClick={() => setSelectedDistributorId(distributor.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-200">{distributor.name}</h5>
                                  <p className="text-xs text-gray-400">{distributor.location}</p>
                                </div>
                                <div className="text-sm text-gray-300">
                                  {distributor.discountRate.toFixed(1)}% discount
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tokenId">Select Coffee Product</Label>
                        <div className="space-y-2 mt-1">
                          {availableTokens.map((token) => (
                            <div
                              key={token.id}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                selectedTokenId === token.tokenId
                                  ? "bg-purple-900/30 border border-purple-500/50"
                                  : "bg-black/20 border border-purple-500/10 hover:border-purple-500/30",
                              )}
                              onClick={() => setSelectedTokenId(token.tokenId)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="bg-purple-900/30 p-2 rounded-lg mr-3">
                                    <Coffee className="h-4 w-4 text-purple-400" />
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

                      <div>
                        <Label htmlFor="orderQuantity">Order Quantity</Label>
                        <Input
                          id="orderQuantity"
                          type="number"
                          value={orderQuantity}
                          onChange={(e) => setOrderQuantity(Number.parseInt(e.target.value))}
                          className="bg-black/30 border-purple-500/30 mt-1"
                          min="1"
                          max={
                            selectedTokenId !== null
                              ? availableTokens.find((t) => t.tokenId === selectedTokenId)?.quantity || 1
                              : 1
                          }
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Number of coffee bags to distribute</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white"
                      disabled={!selectedDistributorId || selectedTokenId === null || isOrdering}
                    >
                      {isOrdering ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          Create Distribution Order
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Distribution Orders</h3>
                {distributionOrders.length === 0 ? (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                    <Package className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                    <p className="text-gray-400">No distribution orders yet</p>
                    <p className="text-sm text-gray-500 mt-2">Create a distribution order to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {distributionOrders.map((order) => {
                      const distributor = distributors.find((d) => d.id === order.distributorId)
                      return (
                        <div
                          key={order.id}
                          className="bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-purple-300">Order #{order.id.split("-")[1]}</h4>
                            <div
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs border flex items-center",
                                order.status === "pending"
                                  ? "bg-amber-900/30 text-amber-300 border-amber-500/30"
                                  : order.status === "processing"
                                    ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                                    : order.status === "shipped"
                                      ? "bg-blue-900/30 text-blue-300 border-blue-500/30"
                                      : "bg-green-900/30 text-green-300 border-green-500/30",
                              )}
                            >
                              {order.status === "pending" && (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Pending
                                </>
                              )}
                              {order.status === "processing" && (
                                <>
                                  <Package className="h-3 w-3 mr-1" /> Processing
                                </>
                              )}
                              {order.status === "shipped" && (
                                <>
                                  <ArrowRight className="h-3 w-3 mr-1" /> Shipped
                                </>
                              )}
                              {order.status === "delivered" && (
                                <>
                                  <Check className="h-3 w-3 mr-1" /> Delivered
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-400 mb-3">
                            <Users className="h-4 w-4 mr-1 text-purple-400" />
                            <span>Distributor: {distributor?.name || "Unknown"}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="text-gray-500">Products:</span>{" "}
                              <span className="text-gray-300">{order.tokenIds.length} types</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>{" "}
                              <span className="text-gray-300">{order.quantities.reduce((a, b) => a + b, 0)} bags</span>
                            </div>
                            {order.trackingInfo && (
                              <>
                                <div>
                                  <span className="text-gray-500">Provider:</span>{" "}
                                  <span className="text-gray-300">{order.trackingInfo.provider}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Tracking:</span>{" "}
                                  <span className="text-gray-300 font-mono">{order.trackingInfo.trackingNumber}</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="mt-2 pt-2 border-t border-purple-500/10 text-xs text-gray-500">
                            Created on {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <DynamicGlowCard variant="emerald" className="p-6">
            <h3 className="text-lg font-medium text-emerald-300 mb-4">Global Distribution Network</h3>
            <div className="relative h-64 md:h-80 bg-black/20 rounded-lg border border-emerald-500/20 overflow-hidden">
              <div className="absolute inset-0 opacity-70">
                <Globe className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-40 w-40 text-emerald-500/20" />
              </div>

              {/* Distribution network visualization */}
              <div className="absolute inset-0 p-4">
                {/* North America */}
                <div className="absolute top-[30%] left-[20%] h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>

                {/* South America */}
                <div className="absolute top-[55%] left-[30%] h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>

                {/* Europe */}
                <div className="absolute top-[30%] left-[45%] h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>

                {/* Africa */}
                <div className="absolute top-[45%] left-[50%] h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>

                {/* Asia */}
                <div className="absolute top-[35%] left-[70%] h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>

                {/* Australia */}
                <div className="absolute top-[65%] left-[80%] h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
                  <line x1="20%" y1="30%" x2="45%" y2="30%" stroke="#10b981" strokeWidth="1" />
                  <line x1="45%" y1="30%" x2="70%" y2="35%" stroke="#10b981" strokeWidth="1" />
                  <line x1="50%" y1="45%" x2="45%" y2="30%" stroke="#10b981" strokeWidth="1" />
                  <line x1="30%" y1="55%" x2="50%" y2="45%" stroke="#10b981" strokeWidth="1" />
                  <line x1="80%" y1="65%" x2="70%" y2="35%" stroke="#10b981" strokeWidth="1" />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-black/50 p-2 rounded-md text-xs">
                  <div className="flex items-center mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-emerald-300">Producer</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-purple-300">Distributor</span>
                  </div>
                </div>

                {/* Phase 1 MVP Label */}
                <div className="absolute top-2 left-2 bg-black/50 p-2 rounded-md text-xs">
                  <span className="text-emerald-300">Phase 1 MVP: Initial Distribution Network</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-3">
                <h4 className="font-medium text-emerald-300 mb-1 text-sm">Community-Driven</h4>
                <p className="text-xs text-gray-400">
                  Our decentralized network of distributors spans the globe, creating economic opportunities while
                  ensuring efficient distribution.
                </p>
              </div>

              <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-3">
                <h4 className="font-medium text-emerald-300 mb-1 text-sm">3PL Integration</h4>
                <p className="text-xs text-gray-400">
                  Seamless integration with third-party logistics providers ensures reliable fulfillment and delivery
                  tracking.
                </p>
              </div>

              <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-3">
                <h4 className="font-medium text-emerald-300 mb-1 text-sm">Tokenized Inventory</h4>
                <p className="text-xs text-gray-400">
                  ERC-1155 tokens represent physical coffee inventory, enabling transparent and efficient management.
                </p>
              </div>
            </div>
          </DynamicGlowCard>
        </div>
      </DynamicGlowCard>
    </div>
  )
}

