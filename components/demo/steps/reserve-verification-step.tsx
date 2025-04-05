"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { useDemoContext } from "@/context/demo-context"
import { Button } from "@/components/ui/button"
import { FileCheck, Loader2, Check, X, LinkIcon, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function ReserveVerificationStep() {
  const { batches, verificationRequests, verifyBatch } = useDemoContext()
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [verificationSteps, setVerificationSteps] = useState([
    { id: "connect", name: "Connect to Oracle", status: "pending" },
    { id: "inspect", name: "Inspect Physical Reserves", status: "pending" },
    { id: "verify", name: "Verify Quantity & Quality", status: "pending" },
    { id: "record", name: "Record on Blockchain", status: "pending" },
  ])

  // Reset verification steps when a new batch is selected
  useEffect(() => {
    if (selectedBatchId) {
      setVerificationSteps([
        { id: "connect", name: "Connect to Oracle", status: "pending" },
        { id: "inspect", name: "Inspect Physical Reserves", status: "pending" },
        { id: "verify", name: "Verify Quantity & Quality", status: "pending" },
        { id: "record", name: "Record on Blockchain", status: "pending" },
      ])
    }
  }, [selectedBatchId])

  const handleVerify = async () => {
    if (!selectedBatchId) return

    setIsVerifying(true)

    // Simulate the verification steps with delays
    setVerificationSteps((prev) =>
      prev.map((step) => (step.id === "connect" ? { ...step, status: "processing" } : step)),
    )

    setTimeout(() => {
      setVerificationSteps((prev) =>
        prev.map((step) => (step.id === "connect" ? { ...step, status: "completed" } : step)),
      )
      setVerificationSteps((prev) =>
        prev.map((step) => (step.id === "inspect" ? { ...step, status: "processing" } : step)),
      )

      setTimeout(() => {
        setVerificationSteps((prev) =>
          prev.map((step) => (step.id === "inspect" ? { ...step, status: "completed" } : step)),
        )
        setVerificationSteps((prev) =>
          prev.map((step) => (step.id === "verify" ? { ...step, status: "processing" } : step)),
        )

        setTimeout(() => {
          setVerificationSteps((prev) =>
            prev.map((step) => (step.id === "verify" ? { ...step, status: "completed" } : step)),
          )
          setVerificationSteps((prev) =>
            prev.map((step) => (step.id === "record" ? { ...step, status: "processing" } : step)),
          )

          // Call the actual verification function
          verifyBatch(selectedBatchId).then(() => {
            setTimeout(() => {
              setVerificationSteps((prev) =>
                prev.map((step) => (step.id === "record" ? { ...step, status: "completed" } : step)),
              )
              setIsVerifying(false)
            }, 2000)
          })
        }, 2000)
      }, 2000)
    }, 2000)
  }

  // Filter batches that can be verified (status is "created")
  const verifiableBatches = batches.filter((batch) => batch.status === "created")

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="purple" className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-900/40 p-3 rounded-full mr-3">
            <FileCheck className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold">
            <span className="web3-dual-gradient-text-glow">Step 2: Reserve Verification</span>
          </h2>
        </div>

        <p className="text-gray-300 mb-6">
          Before coffee can be tokenized, the physical reserves must be verified. The Coffee Tokenization process uses
          Chainlink oracles to connect blockchain data with real-world information. This verification process ensures
          that tokens are backed by actual coffee reserves, maintaining the integrity of the system.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-4">Verify Coffee Reserves</h3>

            {verifiableBatches.length === 0 ? (
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                <FileCheck className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No batches available for verification</p>
                <p className="text-sm text-gray-500 mt-2">Create a batch in Step 1 to proceed with verification</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-purple-300 mb-3">Select a Batch to Verify</h4>
                  <div className="space-y-2">
                    {verifiableBatches.map((batch) => (
                      <div
                        key={batch.id}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors",
                          selectedBatchId === batch.id
                            ? "bg-purple-900/30 border border-purple-500/50"
                            : "bg-black/20 border border-purple-500/10 hover:border-purple-500/30",
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
                          <div className="text-sm text-gray-300">{batch.quantity}kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-emerald-600"
                  disabled={!selectedBatchId || isVerifying}
                  onClick={handleVerify}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" />
                      Verify Reserves
                    </>
                  )}
                </Button>

                {selectedBatchId && (
                  <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-purple-300 mb-3">Verification Process</h4>
                    <div className="space-y-3">
                      {verificationSteps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-purple-500/10"
                        >
                          <span className="text-sm text-gray-300">{step.name}</span>
                          <div>
                            {step.status === "pending" && <span className="text-xs text-gray-500">Pending</span>}
                            {step.status === "processing" && (
                              <span className="text-xs text-amber-400 flex items-center">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Processing
                              </span>
                            )}
                            {step.status === "completed" && (
                              <span className="text-xs text-emerald-400 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            )}
                            {step.status === "failed" && (
                              <span className="text-xs text-red-400 flex items-center">
                                <X className="h-3 w-3 mr-1" />
                                Failed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-4">Verification Requests</h3>
            {verificationRequests.length === 0 ? (
              <div className="bg-black/30 border border-purple-500/20 rounded-lg p-6 text-center">
                <FileCheck className="h-12 w-12 text-purple-500/50 mx-auto mb-3" />
                <p className="text-gray-400">No verification requests yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Select a batch and initiate verification to see requests here
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {verificationRequests.map((request) => {
                  const batch = batches.find((b) => b.id === request.batchId)
                  return (
                    <div
                      key={request.id}
                      className="bg-black/30 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-purple-300">
                          Verification Request #{request.id.split("-")[1]}
                        </h4>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs border",
                            request.status === "pending"
                              ? "bg-amber-900/30 text-amber-300 border-amber-500/30"
                              : request.status === "completed"
                                ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                                : "bg-red-900/30 text-red-300 border-red-500/30",
                          )}
                        >
                          {request.status === "pending" && (
                            <span className="flex items-center">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Pending
                            </span>
                          )}
                          {request.status === "completed" && (
                            <span className="flex items-center">
                              <Check className="h-3 w-3 mr-1" /> Completed
                            </span>
                          )}
                          {request.status === "failed" && (
                            <span className="flex items-center">
                              <X className="h-3 w-3 mr-1" /> Failed
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-2">
                        Batch: <span className="text-gray-300">{batch?.producer || "Unknown"}</span> (
                        <span className="text-gray-300 font-mono">{request.batchId}</span>)
                      </p>

                      {request.status === "completed" && (
                        <div className="mt-3 pt-3 border-t border-purple-500/10">
                          <h5 className="text-sm font-medium text-purple-300 mb-2">Oracle Data</h5>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="text-gray-500">Warehouse:</span>{" "}
                              <span className="text-gray-300">{request.oracleData.warehouseId}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Inspector:</span>{" "}
                              <span className="text-gray-300">{request.oracleData.inspectorId}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>{" "}
                              <span className="text-gray-300">{request.oracleData.quantityVerified}kg</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quality Score:</span>{" "}
                              <span className="text-gray-300">{request.oracleData.qualityScore}/100</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-purple-500/10 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(request.oracleData.timestamp).toLocaleString()}
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
        <h3 className="text-lg font-medium text-emerald-300 mb-4">How Reserve Verification Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">1. Oracle Connection</h4>
            <p className="text-sm text-gray-400">
              Chainlink oracles connect the blockchain to real-world data sources, enabling verification of physical
              coffee reserves.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">2. Physical Inspection</h4>
            <p className="text-sm text-gray-400">
              Authorized inspectors verify the quantity and quality of coffee reserves in warehouses, ensuring they
              match the batch data.
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="font-medium text-emerald-300 mb-2">3. Blockchain Record</h4>
            <p className="text-sm text-gray-400">
              Verification results are recorded on the blockchain, creating a permanent and transparent record that
              enables tokenization.
            </p>
          </div>
        </div>
      </DynamicGlowCard>
    </motion.div>
  )
}

