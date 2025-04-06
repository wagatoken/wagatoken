"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, MessageSquare, Plus, Search, Trash2, User, Clock, Tag } from "lucide-react"
import Link from "next/link"

// Mock data for forum topics
const mockTopics = [
  {
    id: 1,
    title: "Best practices for implementing blockchain in coffee supply chains",
    author: "Sarah Johnson",
    category: "Blockchain",
    replies: 24,
    views: 342,
    status: "Active",
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    title: "Sustainable farming techniques for coffee growers",
    author: "Michael Chen",
    category: "Farming",
    replies: 18,
    views: 256,
    status: "Active",
    lastActivity: "1 day ago",
  },
  {
    id: 3,
    title: "Web3 integration challenges for agricultural products",
    author: "James Wilson",
    category: "Web3",
    replies: 7,
    views: 128,
    status: "Active",
    lastActivity: "3 days ago",
  },
  {
    id: 4,
    title: "Coffee quality assessment using blockchain verification",
    author: "Emma Thompson",
    category: "Quality",
    replies: 12,
    views: 198,
    status: "Locked",
    lastActivity: "1 week ago",
  },
  {
    id: 5,
    title: "Summer camp preparation and logistics",
    author: "Admin",
    category: "Events",
    replies: 32,
    views: 412,
    status: "Pinned",
    lastActivity: "5 hours ago",
  },
]

export default function ForumsAdmin() {
  const [topics, setTopics] = useState(mockTopics)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "" || categoryFilter === "all" || topic.category === categoryFilter
    const matchesStatus = statusFilter === "" || statusFilter === "all" || topic.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = (id: number) => {
    setTopics(topics.filter((topic) => topic.id !== id))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Blockchain":
        return "text-purple-500"
      case "Farming":
        return "text-green-500"
      case "Web3":
        return "text-blue-500"
      case "Quality":
        return "text-amber-500"
      case "Events":
        return "text-rose-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold web3-gradient-text">Forums Management</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">Manage forum topics and discussions</p>
        </div>
        <Button className="web3-button-purple w-full sm:w-auto" asChild>
          <Link href="/admin/forums/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Topic
          </Link>
        </Button>
      </div>

      <Card className="border border-purple-500/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
          <CardTitle>Filter Topics</CardTitle>
          <CardDescription>Search and filter forum topics</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search topics..."
                className="pl-8 border-purple-500/30 focus-visible:ring-purple-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:col-span-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="Farming">Farming</SelectItem>
                  <SelectItem value="Web3">Web3</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Locked">Locked</SelectItem>
                  <SelectItem value="Pinned">Pinned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredTopics.map((topic) => (
          <Card
            key={topic.id}
            className="overflow-hidden border-purple-600/30 hover:border-purple-600/60 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-3 md:p-4 flex items-center justify-center md:w-24">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
              </div>
              <div className="flex-1 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base md:text-lg">{topic.title}</h3>
                      <span
                        className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${
                          topic.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : topic.status === "Locked"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {topic.status}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <User className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-blue-500" /> {topic.author}
                      </span>
                      <span className={`text-xs md:text-sm flex items-center ${getCategoryColor(topic.category)}`}>
                        <Tag className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" /> {topic.category}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <MessageSquare className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-green-500" /> {topic.replies}{" "}
                        replies
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Eye className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-amber-500" /> {topic.views} views
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-purple-500" /> {topic.lastActivity}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 self-end md:self-start mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                      asChild
                    >
                      <Link href={`/admin/forums/${topic.id}`}>
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                        <span className="hidden md:inline">View</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                      asChild
                    >
                      <Link href={`/admin/forums/${topic.id}/edit`}>
                        <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                        <span className="hidden md:inline">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(topic.id)}
                      className="bg-red-500/90 hover:bg-red-600 h-8 w-8 md:w-auto md:px-3"
                    >
                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="hidden md:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

