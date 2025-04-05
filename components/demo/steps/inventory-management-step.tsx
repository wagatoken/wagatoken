"use client"

import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { BarChart3, Coffee, FileCheck, Coins, ShoppingBag, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function InventoryManagementStep() {
  const { batches, mintedTokens, redemptionRequests } = useDemoContext()

  // Calculate inventory statistics
  const totalBatches = batches.length
  const verifiedBatches = batches.filter((batch) => batch.status === "verified" || batch.status === "tokenized").length
  const tokenizedBatches = batches.filter((batch) => batch.status === "tokenized").length
  const redeemedBatches = batches.filter((batch) => batch.status === "redeemed").length

  const totalTokensMinted = mintedTokens.reduce((sum, token) => sum + token.quantity, 0)
  const totalTokensRedeemed = redemptionRequests.reduce((sum, req) => sum + req.quantity, 0)
  const availableTokens = totalTokensMinted - totalTokensRedeemed

  // Calculate percentages for the chart
  const getPercentage = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0)
  const verifiedPercentage = getPercentage(verifiedBatches, totalBatches)
  const tokenizedPercentage = getPercentage(tokenizedBatches, totalBatches)
  const redeemedPercentage = getPercentage(redeemedBatches, totalBatches)

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="purple" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-900/40 p-3 rounded-full mr-3">
            <BarChart3 className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="web3-dual-gradient-text-glow">Step 5: Inventory Management</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          The WAGA Coffee Tokenization system includes automated inventory management features that track coffee
          reserves, token supply, and redemption status. This ensures transparency and efficiency throughout the supply
          chain, with automated alerts for low inventory and expiration dates.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <DynamicGlowCard variant="emerald" className="p-4">
            <h3 className="text-lg font-medium text-emerald-300 mb-3">Batch Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Total Batches</span>
                  <span className="text-sm font-medium text-gray-300">{totalBatches}</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Verified Batches</span>
                  <span className="text-sm font-medium text-gray-300">
                    {verifiedBatches} ({verifiedPercentage}%)
                  </span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-purple-500"
                    style={{ width: `${verifiedPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Tokenized Batches</span>
                  <span className="text-sm font-medium text-gray-300">
                    {tokenizedBatches} ({tokenizedPercentage}%)
                  </span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                    style={{ width: `${tokenizedPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Redeemed Batches</span>
                  <span className="text-sm font-medium text-gray-300">
                    {redeemedBatches} ({redeemedPercentage}%)
                  </span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                    style={{ width: `${redeemedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="purple" className="p-4">
            <h3 className="text-lg font-medium text-purple-300 mb-3">Token Supply</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Total Minted</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{totalTokensMinted}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-amber-400 mr-2" />
                  <span className="text-sm text-gray-300">Total Redeemed</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{totalTokensRedeemed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/20">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="text-sm text-gray-300">Available Tokens</span>
                </div>
                <span className="text-lg font-medium text-gray-200">{availableTokens}</span>
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="emerald" className="p-4">
            <h3 className="text-lg font-medium text-emerald-300 mb-3">System Alerts</h3>
            <div className="space-y-3">
              {totalBatches === 0 ? (
                <div className="flex items-center p-3 bg-black/30 rounded-lg border border-emerald-500/20">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-400">No alerts to display</span>
                </div>
              ) : (
                <>
                  {availableTokens < 50 && (
                    <div className="flex items-start p-3 bg-black/30 rounded-lg border border-amber-500/30">
                      <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-amber-300">Low Token Supply</span>
                        <p className="text-xs text-gray-400 mt-1">
                          Available tokens are running low. Consider minting more tokens from verified batches.
                        </p>
                      </div>
                    </div>
                  )}

                  {verifiedBatches > tokenizedBatches && (
                    <div className="flex items-start p-3 bg-black/30 rounded-lg border border-emerald-500/30">
                      <AlertTriangle className="h-5 w-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-emerald-300">Tokenization Opportunity</span>
                        <p className="text-xs text-gray-400 mt-1">
                          You have verified batches that haven't been tokenized yet. Consider minting tokens to make
                          them available.
                        </p>
                      </div>
                    </div>
                  )}

                  {totalBatches > 0 && totalBatches < 3 && (
                    <div className="flex items-start p-3 bg-black/30 rounded-lg border border-purple-500/30">
                      <AlertTriangle className="h-5 w-5 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-purple-300">Inventory Diversification</span>
                        <p className="text-xs text-gray-400 mt-1">
                          Consider adding more coffee batches to diversify your inventory and increase availability.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DynamicGlowCard>
        </div>

        <h3 className="text-xl font-bold text-purple-300 mb-4">Batch Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-300">Batch ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-300">Producer</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-300">Origin</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-300">Quantity</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                    No batches available. Create batches in Step 1 to see them here.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-purple-500/10 hover:bg-purple-900/10">
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">{batch.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{batch.producer}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {batch.origin} ({batch.variety})
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{batch.quantity}kg</td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs inline-flex items-center",
                          batch.status === "created"
                            ? "bg-gray-800 text-gray-300"
                            : batch.status === "verified"
                              ? "bg-emerald-900/30 text-emerald-300 border border-emerald-500/30"
                              : batch.status === "tokenized"
                                ? "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                                : "bg-amber-900/30 text-amber-300 border border-amber-500/30",
                        )}
                      >
                        {batch.status === "created" && (
                          <>
                            <Coffee className="h-3 w-3 mr-1" />
                            Created
                          </>
                        )}
                        {batch.status === "verified" && (
                          <>
                            <FileCheck className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        )}
                        {batch.status === "tokenized" && (
                          <>
                            <Coins className="h-3 w-3 mr-1" />
                            Tokenized
                          </>
                        )}
                        {batch.status === "redeemed" && (
                          <>
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Redeemed
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DynamicGlowCard>

      <DynamicGlowCard variant="emerald" className="p-6">
        <h3 className="text-lg font-medium text-emerald-300 mb-4">Automated Inventory Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Real-Time Tracking</h4>
            <p className="text-sm text-gray-400">
              The system automatically tracks inventory levels, token supply, and redemption status in real-time,
              providing up-to-date information to all participants.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Smart Alerts</h4>
            <p className="text-sm text-gray-400">
              Automated alerts notify stakeholders about low inventory, expiration dates, and other critical events,
              enabling proactive management.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">Chainlink Automation</h4>
            <p className="text-sm text-gray-400">
              Chainlink Automation is used to trigger inventory checks and updates at regular intervals, ensuring the
              system remains accurate without manual intervention.
            </p>
          </div>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

