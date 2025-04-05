"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { QrCode, Info, ExternalLink, Coffee, MapPin, Calendar, Truck, Factory, ShoppingBag } from "lucide-react"
import { useDemoContext } from "@/context/demo-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Check, Loader2 } from "lucide-react"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function QRTraceabilityStep() {
  const { batches } = useDemoContext()
  const demoData =
    batches.length > 0
      ? batches[0]
      : {
          producer: "Yirgacheffe Cooperative",
          origin: "Ethiopia, Yirgacheffe",
          variety: "Heirloom",
          harvestDate: "October 2023",
          process: "Washed",
          batchId: "ETH-YIR-2023-001",
        }
  const [showBlockchainRecord, setShowBlockchainRecord] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [showScanResult, setShowScanResult] = useState(false)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSimulateScan = () => {
    setIsScanning(true)

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
    }

    // Simulate scanning process with a timeout
    scanTimeoutRef.current = setTimeout(() => {
      setIsScanning(false)
      setShowScanResult(true)
    }, 2000)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <DynamicGlowCard variant="emerald" className="p-6 mb-6">
        <div className="flex items-start mb-6">
          <div className="bg-black/30 p-3 rounded-lg mr-4">
            <QrCode className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              <span className="hero-gradient-text">QR Code Traceability</span>
            </h2>
            <p className="text-gray-300">
              Each retail coffee bag includes a unique QR code that consumers can scan to verify authenticity and trace
              the complete journey of their coffee from farm to cup. This provides transparency and builds trust with
              consumers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <QrCode className="h-32 w-32 text-black" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-emerald-300 mb-2">Scan to Verify</h3>
              <p className="text-gray-400 mb-4">
                Scan this QR code to verify the authenticity of your coffee and trace its journey from farm to cup.
              </p>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-purple-600"
                onClick={handleSimulateScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Simulate QR Scan"
                )}
              </Button>
            </div>
          </div>

          <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-emerald-300 mb-4">Coffee Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Coffee className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Product</p>
                  <p className="text-gray-300">{demoData.producer || "Ethiopian Yirgacheffe - Medium Roast"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Origin</p>
                  <p className="text-gray-300">{demoData.origin || "Yirgacheffe, Ethiopia"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Harvest Date</p>
                  <p className="text-gray-300">{demoData.harvestDate || "October 2023"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Factory className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Processing Method</p>
                  <p className="text-gray-300">{demoData.process || "Washed"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Distribution</p>
                  <p className="text-gray-300">Community Distribution Network</p>
                </div>
              </div>
              <div className="flex items-start">
                <ShoppingBag className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Batch ID</p>
                  <p className="text-gray-300">{demoData.id || "ETH-YIR-2023-001"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-emerald-300 mb-4">Supply Chain Journey</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-500/30"></div>
            <div className="space-y-8">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-emerald-300 font-medium">Farm</h4>
                  <p className="text-gray-400">Harvested at Yirgacheffe Cooperative, Ethiopia</p>
                  <p className="text-xs text-gray-500">October 10, 2023</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-emerald-300 font-medium">Processing</h4>
                  <p className="text-gray-400">Washed and dried at local processing station</p>
                  <p className="text-xs text-gray-500">October 15, 2023</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center">
                  <Coffee className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-emerald-300 font-medium">Roasting</h4>
                  <p className="text-gray-400">Medium roast profile at WAGA partner roastery</p>
                  <p className="text-xs text-gray-500">November 5, 2023</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-emerald-300 font-medium">Distribution</h4>
                  <p className="text-gray-400">Distributed through WAGA community network</p>
                  <p className="text-xs text-gray-500">November 10, 2023</p>
                </div>
              </div>
              <div className="relative pl-10">
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-purple-300 font-medium">Purchase</h4>
                  <p className="text-gray-400">Purchased by consumer</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 border border-emerald-500/20 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Info className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-gray-300">
              All information about this coffee batch is stored on the blockchain, providing immutable proof of its
              journey and characteristics. This ensures transparency and authenticity for consumers.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-emerald-500/30"
              onClick={() => setShowBlockchainRecord(!showBlockchainRecord)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Complete Blockchain Record
            </Button>
          </div>

          {showBlockchainRecord && (
            <div className="mt-4 p-4 bg-black/50 border border-emerald-500/20 rounded-lg overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono">
                {`{
  "tokenId": "ETH-YIR-2023-001",
  "contractAddress": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  "metadata": {
    "name": "Ethiopian Yirgacheffe - Medium Roast",
    "description": "Single-origin coffee from the Yirgacheffe region of Ethiopia",
    "origin": {
      "country": "Ethiopia",
      "region": "Yirgacheffe",
      "farm": "Yirgacheffe Cooperative",
      "altitude": "1,800-2,200 meters"
    },
    "harvest": {
      "date": "October 2023",
      "method": "Hand-picked"
    },
    "processing": {
      "method": "Washed",
      "date": "October 15, 2023",
      "location": "Yirgacheffe Processing Station"
    },
    "roasting": {
      "profile": "Medium",
      "date": "November 5, 2023",
      "roaster": "WAGA Partner Roastery"
    },
    "cupping": {
      "flavor_notes": ["Citrus", "Floral", "Honey"],
      "acidity": "Bright",
      "body": "Medium",
      "score": 86
    }
  },
  "supplyChain": [
    {
      "stage": "Harvest",
      "timestamp": "2023-10-10T08:30:00Z",
      "location": "Yirgacheffe, Ethiopia",
      "verifiedBy": "0xabcdef1234567890abcdef1234567890abcdef12"
    },
    {
      "stage": "Processing",
      "timestamp": "2023-10-15T10:15:00Z",
      "location": "Yirgacheffe Processing Station",
      "verifiedBy": "0xabcdef1234567890abcdef1234567890abcdef12"
    },
    {
      "stage": "Export",
      "timestamp": "2023-10-25T14:20:00Z",
      "location": "Addis Ababa, Ethiopia",
      "verifiedBy": "0x9876543210fedcba9876543210fedcba98765432"
    },
    {
      "stage": "Import",
      "timestamp": "2023-11-02T09:45:00Z",
      "location": "Port of Entry",
      "verifiedBy": "0x1234567890abcdef1234567890abcdef1234567890"
    },
    {
      "stage": "Roasting",
      "timestamp": "2023-11-05T11:30:00Z",
      "location": "WAGA Partner Roastery",
      "verifiedBy": "0x2468ace02468ace02468ace02468ace02468ace0"
    },
    {
      "stage": "Distribution",
      "timestamp": "2023-11-10T13:15:00Z",
      "location": "WAGA Distribution Network",
      "verifiedBy": "0x1357bdf91357bdf91357bdf91357bdf91357bdf9"
    }
  ],
  "tokenization": {
    "mintDate": "2023-11-06T10:00:00Z",
    "mintedBy": "0x2468ace02468ace02468ace02468ace02468ace0",
    "totalSupply": 500,
    "remainingSupply": 423,
    "transactionHash": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z"
  }
}`}
              </pre>
            </div>
          )}
        </div>
      </DynamicGlowCard>
      {/* QR Scan Result Dialog */}
      <Dialog open={showScanResult} onOpenChange={setShowScanResult}>
        <DialogContent className="sm:max-w-md bg-black/90 border border-emerald-500/30">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center">
              <Check className="h-5 w-5 mr-2 text-emerald-400" />
              Verification Successful
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This product has been verified as authentic on the WAGA blockchain.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-black/50 border border-emerald-500/20 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Product:</span>
                <span className="text-emerald-300 font-medium">{demoData.producer || "Ethiopian Yirgacheffe"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Batch ID:</span>
                <span className="text-emerald-300 font-medium">{demoData.id || "ETH-YIR-2023-001"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Origin:</span>
                <span className="text-emerald-300 font-medium">{demoData.origin || "Yirgacheffe, Ethiopia"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified On:</span>
                <span className="text-emerald-300 font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blockchain:</span>
                <span className="text-emerald-300 font-medium">WAGA Protocol</span>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                className="bg-gradient-to-r from-emerald-600 to-purple-600 w-full"
                onClick={() => setShowScanResult(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

