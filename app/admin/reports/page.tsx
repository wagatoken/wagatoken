"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, Flag, AlertTriangle, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import DynamicGlowCard from "@/components/dynamic-glow-card"

// Mock reports data
const mockReports = [
  {
    id: "1",
    type: "Content",
    reason: "Inappropriate content",
    status: "Pending",
    reportedItem: "Forum post: 'WAGA Token Price Discussion'",
    reportedBy: "Maria Chen",
    reportDate: "2023-10-15",
    priority: "High",
  },
  {
    id: "2",
    type: "User",
    reason: "Spam",
    status: "Resolved",
    reportedItem: "User: James Wilson",
    reportedBy: "Admin",
    reportDate: "2023-10-10",
    priority: "Medium",
  },
  {
    id: "3",
    type: "Content",
    reason: "Misinformation",
    status: "Pending",
    reportedItem: "Resource: 'Blockchain Basics'",
    reportedBy: "David Lee",
    reportDate: "2023-10-14",
    priority: "Low",
  },
  {
    id: "4",
    type: "User",
    reason: "Harassment",
    status: "In Review",
    reportedItem: "User: Anonymous123",
    reportedBy: "Sarah Ahmed",
    reportDate: "2023-10-13",
    priority: "High",
  },
  {
    id: "5",
    type: "Content",
    reason: "Copyright violation",
    status: "Resolved",
    reportedItem: "Forum post: 'Coffee Industry Analysis'",
    reportedBy: "Thomas Nguyen",
    reportDate: "2023-10-08",
    priority: "Medium",
  },
]

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  // Filter reports based on search query and filters
  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.reportedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType ? report.type === selectedType : true
    const matchesStatus = selectedStatus ? report.status === selectedStatus : true

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30">
            Pending
          </Badge>
        )
      case "In Review":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">In Review</Badge>
      case "Resolved":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">Resolved</Badge>
        )
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30">High</Badge>
      case "Medium":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/30">Medium</Badge>
        )
      case "Low":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">Low</Badge>
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">{priority}</Badge>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
          <p className="text-muted-foreground">
            Review and manage reported content and users in the WAGA Protocol community.
          </p>
        </div>

        {/* Reports overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DynamicGlowCard variant="emerald" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <h3 className="text-2xl font-bold">{mockReports.length}</h3>
              </div>
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <Flag className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="purple" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h3 className="text-2xl font-bold">{mockReports.filter((r) => r.status === "Pending").length}</h3>
              </div>
              <div className="bg-purple-900/30 p-2 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="emerald" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <h3 className="text-2xl font-bold">{mockReports.filter((r) => r.status === "In Review").length}</h3>
              </div>
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="purple" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <h3 className="text-2xl font-bold">{mockReports.filter((r) => r.status === "Resolved").length}</h3>
              </div>
              <div className="bg-purple-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </DynamicGlowCard>
        </div>

        {/* Filters and actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="pl-8 bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="web3-card-purple">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedType(null)}
                  className={!selectedType ? "bg-purple-500/20" : ""}
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedType("Content")}
                  className={selectedType === "Content" ? "bg-purple-500/20" : ""}
                >
                  Content
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedType("User")}
                  className={selectedType === "User" ? "bg-purple-500/20" : ""}
                >
                  User
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus(null)}
                  className={!selectedStatus ? "bg-purple-500/20" : ""}
                >
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Pending")}
                  className={selectedStatus === "Pending" ? "bg-purple-500/20" : ""}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("In Review")}
                  className={selectedStatus === "In Review" ? "bg-purple-500/20" : ""}
                >
                  In Review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Resolved")}
                  className={selectedStatus === "Resolved" ? "bg-purple-500/20" : ""}
                >
                  Resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Applied filters display */}
        {(selectedType || selectedStatus) && (
          <div className="flex flex-wrap gap-2">
            {selectedType && (
              <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400">
                Type: {selectedType}
                <button className="ml-2 hover:text-purple-300" onClick={() => setSelectedType(null)}>
                  ×
                </button>
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                Status: {selectedStatus}
                <button className="ml-2 hover:text-emerald-300" onClick={() => setSelectedStatus(null)}>
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Reports table */}
        <div className="rounded-md border border-purple-500/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-purple-950/30">
              <TableRow className="hover:bg-purple-950/40 border-purple-500/20">
                <TableHead>Reported Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-purple-950/20 border-purple-500/20">
                    <TableCell>
                      <div className="font-medium">{report.reportedItem}</div>
                    </TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.reportedBy}</TableCell>
                    <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="web3-card-purple">
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {report.status !== "In Review" && (
                            <DropdownMenuItem>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Mark as In Review
                            </DropdownMenuItem>
                          )}
                          {report.status !== "Resolved" && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Dismiss Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No reports found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredReports.length}</strong> of <strong>{mockReports.length}</strong> reports
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10" disabled>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/20 bg-purple-500/20 hover:bg-purple-500/30"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

