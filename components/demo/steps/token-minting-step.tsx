"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"
import { Coins, Loader2, Check, LinkIcon, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function TokenMintingStep() {
  const { batches, mintedTokens, mintTokens } = useDemoContext()
  const [isMinting, setIsMinting] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [mintQuantity, setMintQuantity] = useState(100)

  const handleMint = async () => {
    if (!selectedBatchId) return

    setIsMinting(true)
    await mintTokens(selectedBatchId, mintQuantity)
    setIsMinting(false)
  }

  // Filter batches that can be minted (status is "verified")
  const mintableBatches = batches.filter((batch) => batch.status === "verified")

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="emerald" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-emerald-900/40 p-3 rounded-full mr-3">
            <Coins className="h-6 w-6 text-emerald-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="web3-dual-gradient-text-glow">Step 3: Token Minting</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          Once coffee reserves are verified, they can be tokenized using the ERC-1155 token standard. These tokens
          represent ownership of the physical coffee and can be traded, used as collateral, or redeemed for the actual
          product. The minting process creates a digital representation of the physical asset on the blockchain.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-emerald-300 mb-4">Mint Coffee Tokens</h3>

            {mintableBatches.length === 0 ? (
              <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6 text-center">
                <Coins className="h-12 w-12 text-emerald-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No verified batches available for minting</p>
                <p className="text-sm text-gray-500 mt-2">
                  Complete the verification process in Step 2 to proceed with minting
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-300 mb-3">Select a Verified Batch</h4>
                  <div className="space-y-2">
                    {mintableBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors",
                          selectedBatchId === batch.id
                            ? "bg-emerald-900/30 border border-emerald-500/50"
                            : "bg-black/20 border border-emerald-500/10 hover:border-emerald-500/30",
                        )}
                        onClick={() => setSelectedBatchId(batch.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-200">{batch.producer}</h5>
                            <p className="text-xs text-gray-400">
                              {batch.origin} • {batch.variety} • {batch.process}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-300 mr-2">{batch.quantity}kg</span>
                            <div className="bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full text-xs border border-emerald-500/30 flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Verified
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBatchId && (
                  <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-300 mb-3">Minting Details</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="mintQuantity">Quantity to Mint</Label>
                        <Input
                          id="mintQuantity"
                          type="number"
                          value={mintQuantity}
                          onChange={(e) => setMintQuantity(Number.parseInt(e.target.value))}
                          className="bg-black/30 border-emerald-500/30 mt-1"
                          min="1"
                          max={batches.find((b) => b.id === selectedBatchId)?.quantity || 1000}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This represents the number of tokens to mint from this batch
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-purple-600"
                  disabled={!selectedBatchId || isMinting}
                  onClick={handleMint}
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Minting Tokens...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Mint Tokens
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-emerald-300 mb-4">Minted Tokens</h3>
            {mintedTokens.length === 0 ? (
              <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6 text-center">
                <Coins className="h-12 w-12 text-emerald-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No tokens minted yet</p>
                <p className="text-sm text-gray-500 mt-2">Select a verified batch and mint tokens to see them here</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {mintedTokens.map((token) => {
                  const batch = batches.find((b) => b.id === token.batchId)
                  return (
                    <div
                      key={token.id}
                      className="bg-black/30 border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="bg-emerald-900/30 p-3 rounded-lg mr-3">
                          <Coins className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-emerald-300">{batch?.producer || "Unknown"} Coffee Token</h4>
                          <p className="text-xs text-gray-400 mb-2">
                            Token ID: <span className="font-mono">{token.tokenId}</span>
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="text-gray-500">Quantity:</span>{" "}
                              <span className="text-gray-300">{token.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Packaging:</span>{" "}
                              <span className="text-gray-300">{batch?.packagingInfo || "Unknown"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Origin:</span>{" "}
                              <span className="text-gray-300">{batch?.origin || "Unknown"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Process:</span>{" "}
                              <span className="text-gray-300">{batch?.process || "Unknown"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-emerald-500/10 flex justify-between items-center">
                        <span className="text-xs text-gray-500">Owner: {token.owner.substring(0, 10)}...</span>
                        <a
                          href="#"
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center"
                          onClick={(e) => e.preventDefault()}
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <span className="font-mono">{token.txHash.substring(0, 10)}...</span>
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

      <DynamicGlowCard variant="purple" className="p-6">
        <h3 className="text-lg font-medium text-purple-300 mb-4">About ERC-1155 Tokens</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">Multi-Token Standard</h4>
            <p className="text-sm text-gray-400">
              ERC-1155 is a token standard that allows for the creation of both fungible and non-fungible tokens in a
              single contract, making it ideal for representing coffee batches.
            </p>
          </div>
          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">Batch Operations</h4>
            <p className="text-sm text-gray-400">
              The standard supports batch transfers and operations, reducing gas costs and improving efficiency for
              managing multiple tokens.
            </p>
          </div>
          <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
            <h4 className="font-medium text-purple-300 mb-2">Metadata Management</h4>
            <p className="text-sm text-gray-400">
              Each token can have rich metadata stored on IPFS, including details about the coffee's origin, processing
              method, and quality scores.
            </p>
          </div>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

