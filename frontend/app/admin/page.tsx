"use client";

import { useState, useEffect } from "react";
import { TokenETH, WalletMetamask, NetworkEthereum } from "@web3icons/react";
import {
  MdCheck,
  MdClose,
  MdCoffee,
  MdVerified,
  MdCreate,
  MdAnalytics,
  MdLocationOn,
  MdGrade,
  MdStorage,
  MdStorefront,
  MdTimeline,
} from "react-icons/md";
import {
  generateCoffeeMetadata,
 
  BatchCreationData,
  validateBatchData,
  CoffeeBatchMetadata,
  
} from "@/utils/ipfsMetadata";
import {
  getBatchInfoWithMetadata,
  getActiveBatchIds,
  requestBatchVerification,
  createBatchBlockchainFirst,
  getUserRoles,
} from "@/utils/smartContracts";
import EnvironmentStatus from "@/app/components/EnvironmentStatus";

interface BatchDisplay {
  batchId: string;
  name: string;
  origin: string;
  quantity: number;
  packagingInfo: string;
  pricePerUnit: string;
  isVerified: boolean;
  isMetadataVerified: boolean;
  metadata?: CoffeeBatchMetadata;
}

export default function AdminPage() {
  const { isConnected, address } = useWallet();
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "verify">(
    "create"
  );
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  
  // QR Code state
  const [generatedQRs, setGeneratedQRs] = useState<{
    comprehensive: string;
    verification: string;
  } | null>(null);

  // Batch creation form
  const [batchForm, setBatchForm] = useState<Partial<BatchCreationData>>({
    name: "",
    description: "",
    origin: "",
    farmer: "",
    altitude: "",
    process: "",
    roastProfile: "Medium",
    roastDate: new Date().toISOString().split("T")[0],
    certifications: [],
    cupping_notes: [],
    quantity: 0,
    packagingInfo: "250g",
    pricePerUnit: "0.045",
    productionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (past date)
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  // Load batches
  const loadBatches = async () => {
    try {
      setLoading(true);
      const batchIds = await getActiveBatchIds();

      const batchInfoPromises = batchIds.map(async (id) => {
        const batchInfo = await getBatchInfoWithMetadata(id);
        return {
          batchId: id,
          name: batchInfo.metadata?.name || `Batch ${id}`,
          origin: batchInfo.metadata?.properties.origin || "Unknown",
          quantity: batchInfo.quantity,
          packagingInfo: batchInfo.packagingInfo,
          pricePerUnit: (parseFloat(batchInfo.pricePerUnit) / 1e18).toFixed(4),
          isVerified: batchInfo.isVerified,
          isMetadataVerified: batchInfo.isMetadataVerified,
          metadata: batchInfo.metadata,
        };
      });

      const batchDisplays = await Promise.all(batchInfoPromises);
      setBatches(batchDisplays);
    } catch (err) {
      setError("Failed to load batches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof BatchCreationData, value: any) => {
    setBatchForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleArrayInputChange = (
    field: "certifications" | "cupping_notes",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setBatchForm((prev) => ({ ...prev, [field]: items }));
  };

  // Create batch
  const createBatch = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Validate form
      const validationErrors = validateBatchData(batchForm);
      if (validationErrors.length > 0) {
        setError(`Validation errors: ${validationErrors.join(", ")}`);
        return;
      }

      // Create batch using blockchain-first workflow
      const result = await createBatchBlockchainFirst(
        batchForm as BatchCreationData
      );

      setGeneratedQRs({
        comprehensive: result.qrCodeDataUrl,
        verification: result.verificationQR,
      });

      setSuccess(`Batch created successfully! Batch ID: ${result.batchId}`);

      // Reset form
      setBatchForm({
        name: "",
        description: "",
        origin: "",
        farmer: "",
        altitude: "",
        process: "",
        roastProfile: "Medium",
        roastDate: new Date().toISOString().split("T")[0],
        certifications: [],
        cupping_notes: [],
        quantity: 0,
        packagingInfo: "250g",
        pricePerUnit: "0.045",
        productionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (past date)
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      // Reload batches
      await loadBatches();
    } catch (err) {
      console.error("Error creating batch:", err);
      setError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  // Verify batch
  const verifyBatch = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!selectedBatch) {
        setError("Please select a batch to verify");
        return;
      }

      const javascriptSource = `
        // Chainlink Functions verification script
        const batchId = args[0];
        const expectedQuantity = parseInt(args[1]);
        const expectedPrice = args[2];
        const expectedPackaging = args[3];
        const expectedMetadataHash = args[4];

        // In a real implementation, this would call an external API
        // For demo purposes, we'll simulate successful verification
        const verified = {
          quantity: expectedQuantity,
          price: expectedPrice,
          packaging: expectedPackaging,
          metadataHash: expectedMetadataHash,
          verified: true
        };

        return Functions.encodeString(JSON.stringify(verified));
      `;

      await requestBatchVerification(selectedBatch, javascriptSource);

      setSuccess(`Verification request submitted for Batch ${selectedBatch}`);
      await loadBatches(); // Refresh batch list
    } catch (err) {
      console.error("Error verifying batch:", err);
      setError(err instanceof Error ? err.message : "Failed to verify batch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadBatches();
    }
  }, [isConnected, address]);

  const TabButton = ({
    tab,
    label,
    icon,
  }: {
    tab: string;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`web3-neon-tab flex items-center space-x-3 font-semibold transition-all duration-300 ${
        activeTab === tab ? "active" : ""
      }`}
    >
      {icon && <span className="waga-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-7xl mx-auto web3-page-spacing relative z-10">
        {/* Environment Status Check */}
        <EnvironmentStatus />

        {/* Header */}
        <div className="mb-12 animate-card-entrance">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold web3-gradient-text mb-4">
              WAGA Admin Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create coffee batches, upload to IPFS, verify with Chainlink
              Functions, and generate QR codes for complete blockchain
              traceability
            </p>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="web3-stats-grid">
            <div className="web3-enhanced-stat-card web3-blockchain-pulse group">
              <div className="text-4xl font-bold web3-gradient-text mb-2">
                {batches.length}
              </div>
              <div className="text-gray-600 font-semibold">Total Batches</div>
              <div className="mt-2 text-sm text-emerald-600">
                {batches.filter((b) => b.isVerified).length} verified
              </div>
            </div>
            <div
              className="web3-enhanced-stat-card web3-blockchain-pulse group"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {batches.filter((b) => b.isVerified).length}
              </div>
              <div className="text-emerald-600 font-semibold">
                Verified Batches
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {batches.length > 0
                  ? Math.round(
                      (batches.filter((b) => b.isVerified).length /
                        batches.length) *
                        100
                    )
                  : 0}
                % success rate
              </div>
            </div>
            <div
              className="web3-enhanced-stat-card web3-blockchain-pulse web3-coffee-particles group"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex justify-center mb-4 group-hover:animate-pulse">
                <MdCoffee size={48} className="text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-700 mb-2">
                {batches.reduce((sum, b) => sum + b.quantity, 0)}
              </div>
              <div className="text-emerald-700 font-semibold">
                Total Coffee Bags
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Ready for distribution
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="web3-card text-center animate-card-entrance">
            <div className="mb-4">
              <div className="flex justify-center mb-3">
                <WalletMetamask size={48} variant="branded" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Connect Wallet
              </h3>
              <p className="text-gray-600 mb-4">
                Connect your wallet to access admin functions
              </p>
            </div>
          </div>
        )}

        {isConnected && address && (
          <>
            {/* Connected Wallet Info */}
            <div className="web3-card-wallet animate-card-entrance mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <NetworkEthereum size={24} variant="branded" />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">
                      Connected Wallet
                    </h3>
                    <p className="text-emerald-700 font-mono text-sm">
                      {address.substring(0, 6)}...
                      {address.substring(address.length - 4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 animate-card-entrance">
              <TabButton
                tab="create"
                label="Create Batch"
                icon={<MdCreate size={20} />}
              />
              <TabButton
                tab="manage"
                label="Manage Batches"
                icon={<MdTimeline size={20} />}
              />
              <TabButton
                tab="verify"
                label="Verify & Mint"
                icon={<MdVerified size={20} />}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="web3-card bg-red-50 border border-red-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdClose size={20} className="text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="web3-card bg-green-50 border border-green-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdCheck size={20} className="text-green-500" />
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'create' && (
              <div className="web3-premium-card animate-card-entrance">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Coffee Batch</h2>
                
                {/* Basic Information Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdLocationOn size={20} />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdCoffee size={16} />
                        Batch Name<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Sidama Coffee Batch #1001"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdLocationOn size={16} />
                        Origin/Region<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.origin || ""}
                        onChange={(e) =>
                          handleInputChange("origin", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Sidama, Ethiopia"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdLocationOn size={16} />
                        Farmer/Cooperative<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={batchForm.farmer || ""}
                        onChange={(e) =>
                          handleInputChange("farmer", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Abebe Bekele Cooperative"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Altitude (meters)
                      </label>
                      <input
                        type="text"
                        value={batchForm.altitude || ""}
                        onChange={(e) =>
                          handleInputChange("altitude", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 1,800-2,100m"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing & Production Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdCoffee size={20} />
                    Processing & Production
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label">
                        Processing Method
                      </label>
                      <input
                        type="text"
                        value={batchForm.process || ""}
                        onChange={(e) =>
                          handleInputChange("process", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Washed, Natural, Honey"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">Roast Profile</label>
                      <select
                        value={batchForm.roastProfile || "Medium"}
                        onChange={(e) =>
                          handleInputChange("roastProfile", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                      >
                        <option value="Light">Light Roast</option>
                        <option value="Medium-Light">Medium-Light Roast</option>
                        <option value="Medium">Medium Roast</option>
                        <option value="Medium-Dark">Medium-Dark Roast</option>
                        <option value="Dark">Dark Roast</option>
                      </select>
                    </div>

                    <div>
                      <label className="web3-form-label">Roast Date</label>
                      <input
                        type="date"
                        value={batchForm.roastDate || ""}
                        onChange={(e) =>
                          handleInputChange("roastDate", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Package Size<span className="required">*</span>
                      </label>
                      <select
                        value={batchForm.packagingInfo || "250g"}
                        onChange={(e) =>
                          handleInputChange("packagingInfo", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                      >
                        <option value="250g">250g Bags</option>
                        <option value="500g">500g Bags</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Quality & Certifications Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdGrade size={20} />
                    Quality & Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdGrade size={16} />
                        Certifications (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={batchForm.certifications?.join(", ") || ""}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "certifications",
                            e.target.value
                          )
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Organic, Fair Trade, Rainforest Alliance"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdCoffee size={16} />
                        Cupping Notes (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={batchForm.cupping_notes?.join(", ") || ""}
                        onChange={(e) =>
                          handleArrayInputChange(
                            "cupping_notes",
                            e.target.value
                          )
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., Citrus, Chocolate, Floral, Bright acidity"
                      />
                    </div>
                  </div>
                </div>

                {/* Inventory & Pricing Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdStorage size={20} />
                    Inventory & Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <MdStorage size={16} />
                        Quantity (bags)<span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        value={batchForm.quantity || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 100"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label flex items-center gap-2">
                        <TokenETH size={16} variant="branded" />
                        Price per Unit (USD)<span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={batchForm.pricePerUnit || ""}
                        onChange={(e) =>
                          handleInputChange("pricePerUnit", e.target.value)
                        }
                        className="web3-ethereum-input w-full"
                        placeholder="e.g., 25.00"
                        min="0.01"
                        max="500.00"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Enter price in USD (e.g., $25.00 for a coffee bag)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="web3-form-section">
                  <h3 className="flex items-center gap-2">
                    <MdTimeline size={20} />
                    Important Dates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="web3-form-label">
                        Production Date<span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={
                          batchForm.productionDate
                            ?.toISOString()
                            .split("T")[0] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "productionDate",
                            new Date(e.target.value)
                          )
                        }
                        className="web3-ethereum-input w-full"
                      />
                    </div>

                    <div>
                      <label className="web3-form-label">
                        Expiry Date<span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        value={
                          batchForm.expiryDate?.toISOString().split("T")[0] ||
                          ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "expiryDate",
                            new Date(e.target.value)
                          )
                        }
                        className="web3-ethereum-input w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="web3-form-section">
                  <h3>Description</h3>
                  <div>
                    <label className="web3-form-label">
                      📖 Batch Description<span className="required">*</span>
                    </label>
                    <textarea
                      value={batchForm.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      className="web3-ethereum-input w-full"
                      placeholder="Describe this coffee batch - origin story, flavor profile, processing details, and what makes it special..."
                    />
                  </div>
                </div>

                <button
                  onClick={createBatch}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "web3-gradient-button hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Batch...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdCreate size={20} />
                      Create Batch & Generate QR Codes
                    </div>
                  )}
                </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "manage" && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdStorage size={24} />
                  Manage Coffee Batches
                </h2>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p>Loading batches...</p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">
                      No batches found. Create your first batch!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.batchId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <MdCoffee size={18} />
                              <h3 className="font-semibold text-lg">
                                Batch #{batch.batchId}
                              </h3>
                              <span
                                className={`web3-status-indicator ${
                                  batch.isVerified
                                    ? "web3-status-verified"
                                    : "web3-status-pending"
                                }`}
                              >
                                {batch.isVerified ? "Verified" : "Pending"}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{batch.name}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Origin:</span>{" "}
                                {batch.origin}
                              </div>
                              <div>
                                <span className="font-medium">Quantity:</span>{" "}
                                {batch.quantity} bags
                              </div>
                              <div>
                                <span className="font-medium">Package:</span>{" "}
                                {batch.packagingInfo}
                              </div>
                              <div>
                                <span className="font-medium">Price:</span>{" "}
                                {batch.pricePerUnit} ETH
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "verify" && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdVerified size={24} />
                  Verify Batches & Mint Tokens
                </h2>

                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MdCoffee size={16} />
                    Select Batch to Verify
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a batch...</option>
                    {batches
                      .filter((b) => !b.isVerified)
                      .map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          Batch #{batch.batchId} - {batch.name} (
                          {batch.quantity} bags)
                        </option>
                      ))}
                  </select>
                </div>

                {selectedBatch && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                      <NetworkEthereum size={20} variant="branded" />
                      Verification Process
                    </h3>
                    <p className="text-blue-800 text-sm">
                      This will use Chainlink Functions to verify the batch data
                      against external APIs, and automatically mint tokens to
                      the distributor upon successful verification.
                    </p>
                  </div>
                )}

                <button
                  onClick={verifyBatch}
                  disabled={loading || !selectedBatch}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    loading || !selectedBatch
                      ? "bg-gray-400 cursor-not-allowed"
                      : "web3-gradient-button hover:scale-105"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Verifying Batch...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <MdVerified size={20} />
                      Verify Batch & Mint Tokens
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* QR Codes Display */}
            {generatedQRs && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdTimeline size={24} />
                  Generated QR Codes
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <h3 className="font-semibold mb-4">
                      Comprehensive Batch QR Code
                    </h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img
                        src={generatedQRs.comprehensive}
                        alt="Comprehensive Batch QR Code"
                        className="mx-auto max-w-64"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Contains complete batch information, verification URL, and
                      IPFS metadata
                    </p>
                    <button className="web3-gradient-button flex items-center gap-2 mx-auto">
                      <MdStorefront size={16} />
                      Download QR Code
                    </button>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold mb-4">
                      Simple Verification QR Code
                    </h3>
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <img
                        src={generatedQRs.verification}
                        alt="Verification QR Code"
                        className="mx-auto max-w-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Simple verification URL for quick batch lookup
                    </p>
                    <button className="web3-gradient-button flex items-center gap-2 mx-auto">
                      <MdVerified size={16} />
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
