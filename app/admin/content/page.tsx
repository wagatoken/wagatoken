"use client"

import { useState } from "react"
import { Search, Filter, Plus, Edit, Trash2, ChevronDown, FileText, Video, Image, LinkIcon } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// Mock content data
const mockContent = [
  {
    id: "1",
    title: "Introduction to WAGA Protocol",
    type: "Article",
    status: "Published",
    author: "WAGA Team",
    publishDate: "2023-10-15",
    views: 1245,
    featured: true,
  },
  {
    id: "2",
    title: "How Blockchain Transforms Coffee Supply Chains",
    type: "Article",
    status: "Published",
    author: "Maria Chen",
    publishDate: "2023-10-10",
    views: 876,
    featured: false,
  },
  {
    id: "3",
    title: "WAGA Protocol Demo Walkthrough",
    type: "Video",
    status: "Published",
    author: "James Wilson",
    publishDate: "2023-10-05",
    views: 2134,
    featured: true,
  },
  {
    id: "4",
    title: "Community Distribution Network Explained",
    type: "Article",
    status: "Draft",
    author: "WAGA Team",
    publishDate: "",
    views: 0,
    featured: false,
  },
  {
    id: "5",
    title: "Upcoming Features in WAGA Protocol",
    type: "Article",
    status: "Review",
    author: "Admin",
    publishDate: "",
    views: 0,
    featured: false,
  },
]

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newContent, setNewContent] = useState({
    title: "",
    type: "Article",
    status: "Draft",
    author: "WAGA Team",
    featured: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter content based on search query and filters
  const filteredContent = mockContent.filter((content) => {
    const matchesSearch =
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.author.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedType ? content.type === selectedType : true
    const matchesStatus = selectedStatus ? content.status === selectedStatus : true

    return matchesSearch && matchesType && matchesStatus
  })

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "Article":
        return <FileText className="h-4 w-4 text-emerald-400" />
      case "Video":
        return <Video className="h-4 w-4 text-purple-400" />
      case "Image":
        return <Image className="h-4 w-4 text-blue-400" />
      case "Link":
        return <LinkIcon className="h-4 w-4 text-amber-400" />
      default:
        return <FileText className="h-4 w-4 text-emerald-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30">Published</Badge>
        )
      case "Draft":
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">Draft</Badge>
      case "Review":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30">Review</Badge>
        )
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border-gray-500/30">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage content for the WAGA Protocol platform.</p>
        </div>

        {/* Content overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DynamicGlowCard variant="emerald" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Content</p>
                <h3 className="text-2xl font-bold">{mockContent.length}</h3>
              </div>
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="purple" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <h3 className="text-2xl font-bold">{mockContent.filter((c) => c.status === "Published").length}</h3>
              </div>
              <div className="bg-purple-900/30 p-2 rounded-full">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </DynamicGlowCard>

          <DynamicGlowCard variant="emerald" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <h3 className="text-2xl font-bold">{mockContent.filter((c) => c.featured).length}</h3>
              </div>
              <div className="bg-emerald-900/30 p-2 rounded-full">
                <FileText className="h-5 w-5 text-emerald-400" />
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
                placeholder="Search content..."
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
                  onClick={() => setSelectedType("Article")}
                  className={selectedType === "Article" ? "bg-purple-500/20" : ""}
                >
                  Articles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedType("Video")}
                  className={selectedType === "Video" ? "bg-purple-500/20" : ""}
                >
                  Videos
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
                  onClick={() => setSelectedStatus("Published")}
                  className={selectedStatus === "Published" ? "bg-purple-500/20" : ""}
                >
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Draft")}
                  className={selectedStatus === "Draft" ? "bg-purple-500/20" : ""}
                >
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedStatus("Review")}
                  className={selectedStatus === "Review" ? "bg-purple-500/20" : ""}
                >
                  Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
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

        {/* Content table */}
        <div className="rounded-md border border-purple-500/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-purple-950/30">
              <TableRow className="hover:bg-purple-950/40 border-purple-500/20">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.length > 0 ? (
                filteredContent.map((content) => (
                  <TableRow key={content.id} className="hover:bg-purple-950/20 border-purple-500/20">
                    <TableCell>
                      <div className="flex items-center">
                        {content.featured && (
                          <Badge className="mr-2 bg-amber-500/20 text-amber-400 border-amber-500/30">Featured</Badge>
                        )}
                        <span className="font-medium">{content.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getContentTypeIcon(content.type)}
                        <span className="ml-2">{content.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(content.status)}</TableCell>
                    <TableCell>{content.author}</TableCell>
                    <TableCell>
                      {content.publishDate ? new Date(content.publishDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>{content.views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="web3-card-purple">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {content.featured ? (
                              <>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Remove from Featured
                              </>
                            ) : (
                              <>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Add to Featured
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No content found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredContent.length}</strong> of <strong>{mockContent.length}</strong> items
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-gray-950 border border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Content</DialogTitle>
            <DialogDescription>
              Fill in the details below to create new content for the WAGA Protocol platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter content title"
                className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50"
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Content Type</Label>
              <RadioGroup
                defaultValue={newContent.type}
                onValueChange={(value) => setNewContent({ ...newContent, type: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Article" id="article" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="article" className="cursor-pointer flex items-center">
                    <FileText className="h-4 w-4 text-emerald-400 mr-1" /> Article
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Video" id="video" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="video" className="cursor-pointer flex items-center">
                    <Video className="h-4 w-4 text-purple-400 mr-1" /> Video
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Image" id="image" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="image" className="cursor-pointer flex items-center">
                    <Image className="h-4 w-4 text-blue-400 mr-1" /> Image
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter content description"
                className="bg-background/50 border-purple-500/20 focus:border-emerald-500/50 min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Initial Status</Label>
              <RadioGroup
                defaultValue={newContent.status}
                onValueChange={(value) => setNewContent({ ...newContent, status: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Draft" id="draft" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="draft" className="cursor-pointer">
                    Draft
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Review" id="review" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="review" className="cursor-pointer">
                    Review
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Published" id="published" className="border-purple-500/50 text-emerald-500" />
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={newContent.featured}
                onCheckedChange={(checked) => setNewContent({ ...newContent, featured: checked })}
                className="data-[state=checked]:bg-emerald-500"
              />
              <Label htmlFor="featured">Feature this content</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-purple-500/20">
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500"
              onClick={() => {
                setIsSubmitting(true)
                // Simulate API call
                setTimeout(() => {
                  // Add the new content to the mock data
                  const newContentItem = {
                    id: (mockContent.length + 1).toString(),
                    title: newContent.title || "Untitled Content",
                    type: newContent.type,
                    status: newContent.status,
                    author: newContent.author,
                    publishDate: newContent.status === "Published" ? new Date().toISOString().split("T")[0] : "",
                    views: 0,
                    featured: newContent.featured,
                  }

                  mockContent.unshift(newContentItem)

                  // Reset form and close dialog
                  setNewContent({
                    title: "",
                    type: "Article",
                    status: "Draft",
                    author: "WAGA Team",
                    featured: false,
                  })
                  setIsSubmitting(false)
                  setCreateDialogOpen(false)
                }, 1000)
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                "Create Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

