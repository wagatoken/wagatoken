"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Trash2, Upload, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

// Mock data for resources
const mockResources = [
  {
    id: 1,
    title: "Coffee Farming Best Practices",
    type: "PDF",
    category: "Farming",
    dateAdded: "2023-10-15",
    downloads: 128,
  },
  {
    id: 2,
    title: "Blockchain for Beginners",
    type: "Video",
    category: "Blockchain",
    dateAdded: "2023-09-22",
    downloads: 256,
  },
  {
    id: 3,
    title: "Supply Chain Transparency Guide",
    type: "PDF",
    category: "Supply Chain",
    dateAdded: "2023-11-05",
    downloads: 87,
  },
  {
    id: 4,
    title: "Web3 Integration Tutorial",
    type: "Video",
    category: "Web3",
    dateAdded: "2023-10-30",
    downloads: 192,
  },
  {
    id: 5,
    title: "Coffee Quality Assessment",
    type: "PDF",
    category: "Quality",
    dateAdded: "2023-11-12",
    downloads: 64,
  },
]

export default function ResourcesAdmin() {
  const [resources, setResources] = useState(mockResources)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "" || categoryFilter === "all" || resource.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDelete = (id: number) => {
    setResources(resources.filter((resource) => resource.id !== id))
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-10 w-10 text-rose-500" />
      case "Video":
        return <ExternalLink className="h-10 w-10 text-blue-500" />
      default:
        return <FileText className="h-10 w-10 text-primary" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold web3-gradient-text">Resources Management</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Upload, edit, and manage educational resources
          </p>
        </div>
        <Button className="web3-button-purple w-full sm:w-auto" asChild>
          <Link href="/admin/resources/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Resource
          </Link>
        </Button>
      </div>

      <Card className="border border-purple-500/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
          <CardTitle>Filter Resources</CardTitle>
          <CardDescription>Search and filter the resource library</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search resources..."
                className="pl-8 border-purple-500/30 focus-visible:ring-purple-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Farming">Farming</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                  <SelectItem value="Web3">Web3</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="downloads">Most Downloads</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            className="overflow-hidden border-purple-600/30 hover:border-purple-600/60 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-3 md:p-4 flex items-center justify-center md:w-24">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">{resource.title}</h3>
                    <div className="flex items-center mt-1 space-x-2 md:space-x-4 flex-wrap">
                      <span
                        className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${
                          resource.type === "PDF"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {resource.type}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">Category: {resource.category}</span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground">Added: {resource.dateAdded}</span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Download className="h-3 w-3 mr-1" /> {resource.downloads} downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 self-end md:self-start mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                    >
                      <Upload className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                      <span className="hidden md:inline">Update</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resource.id)}
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

