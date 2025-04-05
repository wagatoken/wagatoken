"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  MessageSquare,
  FileText,
  Calendar,
  BarChart,
  Flag,
  Settings,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

// This would come from your API in a real implementation
const fetchDashboardData = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    stats: [
      {
        label: "Total Users",
        value: "12",
        icon: <Users className="h-5 w-5 text-emerald-400" />,
        change: "+12%",
        route: "/admin/users",
      },
      {
        label: "Active Discussions",
        value: "3",
        icon: <MessageSquare className="h-5 w-5 text-purple-400" />,
        change: "New",
        route: "/admin/content",
      },
      {
        label: "Resources",
        value: "5",
        icon: <FileText className="h-5 w-5 text-emerald-400" />,
        change: "+5",
        route: "/admin/content",
      },
      {
        label: "Upcoming Events",
        value: "0",
        icon: <Calendar className="h-5 w-5 text-purple-400" />,
        change: "—",
        route: "/admin/content",
      },
    ],
    recentActivities: [
      { type: "user", message: "New user registered: Maria Chen", time: "5 minutes ago" },
      { type: "user", message: "New user registered: James Wilson", time: "2 hours ago" },
      { type: "resource", message: "New resource uploaded: WAGA Protocol Introduction", time: "1 day ago" },
      { type: "resource", message: "New resource uploaded: Getting Started Guide", time: "2 days ago" },
    ],
    growthData: {
      userGrowth: 12,
      engagementRate: 8,
      resourceDownloads: 5,
    },
  }
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleNavigate = (route: string) => {
    router.push(route)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-emerald-400">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DynamicGlowCard variant="purple" className="p-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-emerald-600 to-purple-600"
            >
              Try Again
            </Button>
          </div>
        </DynamicGlowCard>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader title="Admin Dashboard" description="Manage and monitor the WAGA Protocol community" />

      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-black/50 border border-emerald-500/20 rounded-lg p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            onClick={() => router.push("/admin/users")}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            onClick={() => router.push("/admin/content")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            onClick={() => router.push("/admin/reports")}
          >
            <Flag className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-300"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {/* Stats Cards */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dashboardData.stats.map((stat, index) => (
                <DynamicGlowCard
                  key={index}
                  variant={index % 2 === 0 ? "emerald" : "purple"}
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleNavigate(stat.route)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-black/30 p-3 rounded-lg">{stat.icon}</div>
                    <div className="bg-emerald-900/30 px-2 py-1 rounded-full text-xs font-medium text-emerald-300">
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-200 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </DynamicGlowCard>
              ))}
            </motion.div>

            {/* Activity and Insights */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <motion.div variants={fadeIn} className="lg:col-span-2">
                <DynamicGlowCard variant="emerald" className="p-6 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      <span className="hero-gradient-text">Recent Activity</span>
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                      onClick={() => router.push("/admin/reports")}
                    >
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={index} className="p-4 rounded-md bg-black/30 border border-emerald-500/10">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            {activity.type === "user" && <UserPlus className="h-5 w-5 text-emerald-400" />}
                            {activity.type === "report" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                            {activity.type === "event" && <Calendar className="h-5 w-5 text-purple-400" />}
                            {activity.type === "resource" && <FileText className="h-5 w-5 text-emerald-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-300">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DynamicGlowCard>
              </motion.div>

              <motion.div variants={fadeIn}>
                <DynamicGlowCard variant="purple" className="p-6 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      <span className="hero-gradient-text">Growth Insights</span>
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                      onClick={() => router.push("/admin/reports")}
                    >
                      Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-md bg-black/30 border border-purple-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-300">User Growth</h3>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="h-2 bg-black/50 rounded-full mb-2">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"
                          style={{ width: `${dashboardData.growthData.userGrowth}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>First week of launch</span>
                        <span>{dashboardData.growthData.userGrowth}%</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-black/30 border border-purple-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-300">Engagement Rate</h3>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="h-2 bg-black/50 rounded-full mb-2">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"
                          style={{ width: `${dashboardData.growthData.engagementRate}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Starting to grow</span>
                        <span>{dashboardData.growthData.engagementRate}%</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-md bg-black/30 border border-purple-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-300">Resource Downloads</h3>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="h-2 bg-black/50 rounded-full mb-2">
                        <div
                          className="h-2 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full"
                          style={{ width: `${dashboardData.growthData.resourceDownloads}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Just launched</span>
                        <span>{dashboardData.growthData.resourceDownloads}%</span>
                      </div>
                    </div>
                  </div>
                </DynamicGlowCard>
              </motion.div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="users">
          <DynamicGlowCard variant="emerald" className="p-6">
            <h2 className="text-xl font-bold mb-4">
              <span className="hero-gradient-text">User Management</span>
            </h2>
            <p className="text-gray-400 mb-4">This section will contain user management tools.</p>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={() => router.push("/admin/users")}
            >
              Go to User Management
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DynamicGlowCard>
        </TabsContent>

        <TabsContent value="content">
          <DynamicGlowCard variant="emerald" className="p-6">
            <h2 className="text-xl font-bold mb-4">
              <span className="hero-gradient-text">Content Management</span>
            </h2>
            <p className="text-gray-400 mb-4">This section will contain content management tools.</p>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={() => router.push("/admin/content")}
            >
              Go to Content Management
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DynamicGlowCard>
        </TabsContent>

        <TabsContent value="reports">
          <DynamicGlowCard variant="emerald" className="p-6">
            <h2 className="text-xl font-bold mb-4">
              <span className="hero-gradient-text">Reports Management</span>
            </h2>
            <p className="text-gray-400 mb-4">This section will contain reports management tools.</p>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={() => router.push("/admin/reports")}
            >
              Go to Reports Management
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DynamicGlowCard>
        </TabsContent>

        <TabsContent value="settings">
          <DynamicGlowCard variant="emerald" className="p-6">
            <h2 className="text-xl font-bold mb-4">
              <span className="hero-gradient-text">Community Settings</span>
            </h2>
            <p className="text-gray-400 mb-4">This section will contain community settings.</p>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={() => router.push("/admin/settings")}
            >
              Go to Settings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DynamicGlowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

