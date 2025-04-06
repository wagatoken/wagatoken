"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileText, Bookmark, Share2, ThumbsUp, MessageSquare, Calendar, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Sample resource data - in a real app, this would be fetched based on the ID
const resourceData = {
  id: 1,
  title: "Blockchain for Agriculture: A Primer",
  type: "PDF Guide",
  category: "Web3 & Blockchain",
  description:
    "An introduction to blockchain technology and its applications in agriculture, with a focus on coffee supply chains.",
  longDescription: `
    <p>This comprehensive guide introduces blockchain technology and its transformative potential for agricultural supply chains, with a special focus on coffee production and distribution.</p>
    
    <p>Inside this guide, you'll learn:</p>
    
    <ul>
      <li>The fundamentals of blockchain technology explained in simple terms</li>
      <li>How blockchain creates transparency and traceability in agricultural supply chains</li>
      <li>Real-world examples of blockchain implementation in coffee production</li>
      <li>The benefits for farmers, processors, distributors, and consumers</li>
      <li>Step-by-step approach to implementing blockchain in your agricultural business</li>
      <li>Common challenges and how to overcome them</li>
    </ul>
    
    <p>Whether you're a coffee farmer, processor, distributor, or technology enthusiast, this guide provides a solid foundation for understanding how blockchain can revolutionize the agricultural industry.</p>
  `,
  image: "/placeholder.svg?height=400&width=800",
  downloadable: true,
  downloadUrl: "#",
  fileSize: "2.4 MB",
  fileType: "PDF",
  datePublished: "April 15, 2024",
  author: "WAGA Academy Team",
  views: 342,
  downloads: 156,
  likes: 48,
  comments: 12,
}

// Sample related resources
const relatedResources = [
  {
    id: 3,
    title: "Setting Up a Crypto Wallet",
    type: "Tutorial",
    category: "Web3 & Blockchain",
  },
  {
    id: 5,
    title: "Introduction to DeFi for Coffee Farmers",
    type: "Presentation",
    category: "Finance & Accounting",
  },
]

export default function ResourcePage({ params }: { params: { id: string } }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(resourceData.likes)

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Bookmark removed" : "Bookmark added",
      description: isBookmarked ? "Resource removed from your bookmarks" : "Resource added to your bookmarks",
    })
  }

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your download should begin shortly",
    })
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog or copy a link to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied",
        description: "Resource link copied to clipboard",
      })
    })
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <Link href="/community/resources" className="link-emerald flex items-center mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Resources
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative h-[300px] rounded-xl overflow-hidden web3-card-glow-border">
                <Image
                  src={resourceData.image || "/placeholder.svg"}
                  alt={resourceData.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="badge-emerald">{resourceData.type}</Badge>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tighter web3-gradient-text-enhanced">
                  {resourceData.title}
                </h1>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Badge variant="outline" className="badge-emerald">
                    {resourceData.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 icon-emerald" />
                    <span>
                      {resourceData.fileType} • {resourceData.fileSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 icon-emerald" />
                    <span>Published: {resourceData.datePublished}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4 icon-emerald" />
                    <span>By: {resourceData.author}</span>
                  </div>
                </div>
              </div>

              <Card className="web3-card-gradient hover-lift">
                <CardHeader className="card-header-gradient">
                  <CardTitle>About This Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: resourceData.longDescription }}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={
                        isLiked
                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          : "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                      }
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" /> {likeCount}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                    >
                      <MessageSquare className="mr-1 h-4 w-4" /> {resourceData.comments}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      className={
                        isBookmarked
                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                          : "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                      }
                    >
                      <Bookmark className="mr-1 h-4 w-4" /> {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10"
                    >
                      <Share2 className="mr-1 h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              {resourceData.downloadable && (
                <Card className="web3-card-glow-border hover-lift">
                  <CardHeader className="card-header-gradient">
                    <CardTitle>Download Resource</CardTitle>
                    <CardDescription>Access this resource offline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="bg-emerald-500/10 p-4 rounded-md inline-flex mx-auto">
                        <FileText className="h-8 w-8 icon-emerald" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {resourceData.fileType} • {resourceData.fileSize}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Downloaded {resourceData.downloads} times</p>
                      </div>
                      <Button className="w-full web3-button-purple" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="web3-card-glass hover-lift">
                <CardHeader className="card-header-gradient">
                  <CardTitle>Resource Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-emerald-500/10 p-3 rounded-md">
                      <p className="text-lg font-bold text-emerald-400">{resourceData.views}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="bg-emerald-500/10 p-3 rounded-md">
                      <p className="text-lg font-bold text-emerald-400">{resourceData.downloads}</p>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div className="bg-emerald-500/10 p-3 rounded-md">
                      <p className="text-lg font-bold text-emerald-400">{resourceData.likes}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="web3-card-glass hover-lift">
                <CardHeader className="card-header-gradient">
                  <CardTitle>Related Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedResources.map((resource) => {
                    // Assign different background colors based on category
                    let bgClass = "bg-emerald-500/10"
                    let textClass = "text-emerald-400"
                    if (resource.category === "Finance & Accounting") {
                      bgClass = "bg-emerald-500/10"
                      textClass = "text-emerald-400"
                    }

                    return (
                      <div key={resource.id} className="flex items-start gap-3">
                        <div className={`${bgClass} p-2 rounded-md`}>
                          <FileText className={`h-4 w-4 ${textClass}`} />
                        </div>
                        <div>
                          <Link
                            href={`/community/resources/${resource.id}`}
                            className="text-sm font-medium link-emerald"
                          >
                            {resource.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs badge-emerald">
                              {resource.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{resource.type}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

