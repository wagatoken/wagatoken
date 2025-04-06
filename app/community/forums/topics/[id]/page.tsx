"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, Flag, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Sample topic data
const topicData = {
  id: 1,
  title: "How can blockchain improve coffee farmer incomes?",
  category: "Web3 & Blockchain",
  author: "CoffeeChain",
  avatar: "CC",
  date: "May 10, 2024",
  content: `
    <p>I've been researching how blockchain technology could potentially help coffee farmers increase their income, and I'd love to hear thoughts from this community.</p>
    
    <p>From what I understand, blockchain could help in several ways:</p>
    
    <ul>
      <li>Providing traceability from farm to cup, allowing for premium pricing</li>
      <li>Enabling direct-to-consumer sales, cutting out middlemen</li>
      <li>Creating yield-based lending opportunities through DeFi</li>
      <li>Tokenizing future harvests to access capital earlier</li>
    </ul>
    
    <p>Has anyone here worked on blockchain projects specifically for coffee farmers? What challenges did you face? Were there any unexpected benefits?</p>
    
    <p>I'm particularly interested in real-world examples where this has actually improved farmer incomes, not just theoretical applications.</p>
  `,
  replies: [
    {
      id: 1,
      author: "EthioExplorer",
      avatar: "EE",
      date: "May 10, 2024",
      content: `
        <p>Great question! I've been working with coffee cooperatives in Ethiopia on a blockchain traceability pilot. The biggest challenge we faced was the "last mile" problem - getting reliable data from the farm level into the blockchain.</p>
        
        <p>We solved this by creating a simple mobile app that works offline and syncs when connectivity is available. The farmers can record their harvests, processing methods, and other data points.</p>
        
        <p>As for income improvements, we've seen a 15-20% premium for fully traceable coffee in certain markets. The key was connecting the blockchain data to a consumer-facing app that tells the story of each batch of coffee.</p>
      `,
      likes: 12,
    },
    {
      id: 2,
      author: "DeFiDeveloper",
      avatar: "DD",
      date: "May 11, 2024",
      content: `
        <p>I've been exploring the DeFi angle for agricultural financing. Traditional banks often won't lend to smallholder farmers, but with blockchain, we can create lending pools backed by future yield.</p>
        
        <p>The challenge is creating reliable price oracles for coffee futures that account for quality differences. We're working on a solution that combines market data with quality assessments from certified cuppers.</p>
        
        <p>One unexpected benefit: farmers who participate in these DeFi protocols are becoming more financially literate and starting to explore other blockchain applications.</p>
      `,
      likes: 8,
    },
    {
      id: 3,
      author: "CoffeeRoaster",
      avatar: "CR",
      date: "May 12, 2024",
      content: `
        <p>From a roaster's perspective, I'm willing to pay more for coffee with verified provenance. My customers increasingly want to know the story behind their coffee, and blockchain provides that transparency in a way that's difficult to fake.</p>
        
        <p>However, I think we need to be careful about overselling the technology. Blockchain alone won't fix structural inequalities in the coffee supply chain. It needs to be part of a broader approach that includes fair trade practices, sustainable farming techniques, and direct relationships.</p>
      `,
      likes: 15,
    },
  ],
}

export default function TopicPage({ params }: { params: { id: string } }) {
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setReplyContent("")
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully",
      })
    }, 1000)
  }

  const handleLike = (replyId: number) => {
    toast({
      title: "Liked",
      description: "You liked this reply",
    })
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div>
          <Link href="/community/forums" className="link-emerald flex items-center mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Forums
          </Link>
          <h1 className="text-2xl font-bold tracking-tighter mt-2 web3-gradient-text-enhanced">{topicData.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="badge-emerald">
              {topicData.category}
            </Badge>
            <span className="text-sm text-muted-foreground">Started by {topicData.author}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{topicData.date}</span>
          </div>
        </div>

        <Card className="web3-card-glow-border hover-lift">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10 ring-2 ring-emerald-500/30">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={topicData.author} />
                  <AvatarFallback className="bg-emerald-900/50">{topicData.avatar}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-grow space-y-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{topicData.author}</span>
                    <span className="text-xs text-emerald-400 ml-2">Topic Starter</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{topicData.date}</span>
                </div>
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: topicData.content }}
                />
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Heart className="mr-1 h-4 w-4" /> Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Flag className="mr-1 h-4 w-4" /> Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold web3-gradient-text">Replies ({topicData.replies.length})</h2>

          {topicData.replies.map((reply) => (
            <Card key={reply.id} className="web3-card-glass hover-lift">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-500/30">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={reply.author} />
                      <AvatarFallback className="bg-emerald-900/50">{reply.avatar}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">{reply.date}</span>
                    </div>
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => handleLike(reply.id)}
                      >
                        <Heart className="mr-1 h-4 w-4" /> {reply.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Share2 className="mr-1 h-4 w-4" /> Share
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Flag className="mr-1 h-4 w-4" /> Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="web3-card-gradient">
          <CardHeader className="card-header-gradient">
            <h2 className="text-xl font-bold web3-gradient-text">Post a Reply</h2>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your reply here..."
              className="min-h-[150px] web3-input-glow focus-emerald"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="web3-button-purple" onClick={handleSubmitReply} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Reply"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

