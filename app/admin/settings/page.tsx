"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, RefreshCw, Shield, Globe, Bell, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DynamicGlowCard from "@/components/dynamic-glow-card"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)

  // Mock settings data
  const [settings, setSettings] = useState({
    general: {
      communityName: "WAGA Protocol Community",
      description:
        "A community dedicated to transparent and sustainable coffee supply chains through blockchain technology.",
      logoUrl: "",
      contactEmail: "admin@wagaprotocol.io",
      maintenanceMode: false,
    },
    security: {
      twoFactorAuth: true,
      passwordPolicy: "strong",
      sessionTimeout: 60,
      ipRestriction: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      digestFrequency: "daily",
      adminAlerts: true,
    },
    blockchain: {
      networkType: "testnet",
      contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
      gasStrategy: "standard",
      autoMint: true,
    },
  })

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">Configure and manage the WAGA Protocol platform settings.</p>
        </div>

        <Tabs defaultValue="general" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-emerald-500/20 rounded-lg p-1">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            >
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="blockchain"
              className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            >
              <Database className="h-4 w-4 mr-2" />
              Blockchain
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <DynamicGlowCard variant="emerald" className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  <span className="hero-gradient-text">General Settings</span>
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="communityName">Community Name</Label>
                      <Input
                        id="communityName"
                        value={settings.general.communityName}
                        onChange={(e) => handleChange("general", "communityName", e.target.value)}
                        className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => handleChange("general", "contactEmail", e.target.value)}
                        className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Community Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={settings.general.description}
                      onChange={(e) => handleChange("general", "description", e.target.value)}
                      className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={settings.general.logoUrl}
                      onChange={(e) => handleChange("general", "logoUrl", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) => handleChange("general", "maintenanceMode", checked)}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <DynamicGlowCard variant="purple" className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  <span className="hero-gradient-text">Security Settings</span>
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => handleChange("security", "twoFactorAuth", checked)}
                    />
                    <Label htmlFor="twoFactorAuth">Require Two-Factor Authentication for Admins</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <select
                      id="passwordPolicy"
                      value={settings.security.passwordPolicy}
                      onChange={(e) => handleChange("security", "passwordPolicy", e.target.value)}
                      className="w-full rounded-md border border-purple-500/20 bg-background/50 px-3 py-2 text-sm focus:border-emerald-500/50"
                    >
                      <option value="basic">Basic (8+ characters)</option>
                      <option value="medium">Medium (8+ chars, mixed case)</option>
                      <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleChange("security", "sessionTimeout", Number.parseInt(e.target.value))}
                      className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ipRestriction"
                      checked={settings.security.ipRestriction}
                      onCheckedChange={(checked) => handleChange("security", "ipRestriction", checked)}
                    />
                    <Label htmlFor="ipRestriction">Enable IP Restriction for Admin Access</Label>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <DynamicGlowCard variant="emerald" className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  <span className="hero-gradient-text">Notification Settings</span>
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleChange("notifications", "emailNotifications", checked)}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => handleChange("notifications", "pushNotifications", checked)}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="digestFrequency">Digest Frequency</Label>
                    <select
                      id="digestFrequency"
                      value={settings.notifications.digestFrequency}
                      onChange={(e) => handleChange("notifications", "digestFrequency", e.target.value)}
                      className="w-full rounded-md border border-purple-500/20 bg-background/50 px-3 py-2 text-sm focus:border-emerald-500/50"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="adminAlerts"
                      checked={settings.notifications.adminAlerts}
                      onCheckedChange={(checked) => handleChange("notifications", "adminAlerts", checked)}
                    />
                    <Label htmlFor="adminAlerts">Critical Admin Alerts</Label>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>
          </TabsContent>

          {/* Blockchain Settings */}
          <TabsContent value="blockchain">
            <motion.div variants={fadeIn} initial="hidden" animate="visible">
              <DynamicGlowCard variant="purple" className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  <span className="hero-gradient-text">Blockchain Settings</span>
                </h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="networkType">Network Type</Label>
                    <select
                      id="networkType"
                      value={settings.blockchain.networkType}
                      onChange={(e) => handleChange("blockchain", "networkType", e.target.value)}
                      className="w-full rounded-md border border-purple-500/20 bg-background/50 px-3 py-2 text-sm focus:border-emerald-500/50"
                    >
                      <option value="mainnet">Mainnet</option>
                      <option value="testnet">Testnet</option>
                      <option value="devnet">Development Network</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractAddress">Smart Contract Address</Label>
                    <Input
                      id="contractAddress"
                      value={settings.blockchain.contractAddress}
                      onChange={(e) => handleChange("blockchain", "contractAddress", e.target.value)}
                      className="font-mono bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gasStrategy">Gas Price Strategy</Label>
                    <select
                      id="gasStrategy"
                      value={settings.blockchain.gasStrategy}
                      onChange={(e) => handleChange("blockchain", "gasStrategy", e.target.value)}
                      className="w-full rounded-md border border-purple-500/20 bg-background/50 px-3 py-2 text-sm focus:border-emerald-500/50"
                    >
                      <option value="slow">Slow (Lowest Fee)</option>
                      <option value="standard">Standard</option>
                      <option value="fast">Fast</option>
                      <option value="instant">Instant (Highest Fee)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoMint"
                      checked={settings.blockchain.autoMint}
                      onCheckedChange={(checked) => handleChange("blockchain", "autoMint", checked)}
                    />
                    <Label htmlFor="autoMint">Automatic Token Minting</Label>
                  </div>
                </div>
              </DynamicGlowCard>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            className="border-purple-500/20 hover:bg-purple-500/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

