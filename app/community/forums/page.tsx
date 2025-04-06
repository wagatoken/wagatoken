import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Plus, Search } from "lucide-react"

// Sample forum categories
const categories = [
  {
    id: "general",
    name: "General Discussion",
    description: "General discussions about WAGA Academy and the community",
    topics: 24,
    posts: 142,
  },
  {
    id: "web3",
    name: "Web3 & Blockchain",
    description: "Discussions about blockchain technology, DeFi, and tokenization",
    topics: 18,
    posts: 97,
  },
  {
    id: "coffee",
    name: "Coffee Industry",
    description: "Discussions about coffee farming, processing, and the global coffee market",
    topics: 15,
    posts: 83,
  },
  {
    id: "education",
    name: "Education & Training",
    description: "Discussions about learning resources, courses, and educational approaches",
    topics: 12,
    posts: 64,
  },
  {
    id: "summer-camp",
    name: "Summer Camp",
    description: "Discussions about the WAGA Summer Camp program and experiences",
    topics: 8,
    posts: 42,
  },
]

// Sample forum topics
const recentTopics = [
  {
    id: 1,
    title: "How can blockchain improve coffee farmer incomes?",
    category: "web3",
    author: "CoffeeChain",
    avatar: "CC",
    replies: 24,
    views: 156,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    title: "Summer Camp 2024: What to expect?",
    category: "summer-camp",
    author: "EthioExplorer",
    avatar: "EE",
    replies: 18,
    views: 132,
    lastActive: "5 hours ago",
  },
  {
    id: 3,
    title: "DeFi lending models for smallholder farmers",
    category: "web3",
    author: "CryptoFarmer",
    avatar: "CF",
    replies: 32,
    views: 215,
    lastActive: "1 day ago",
  },
  {
    id: 4,
    title: "Introducing myself: Coffee roaster from Colombia",
    category: "general",
    author: "BeanMaster",
    avatar: "BM",
    replies: 15,
    views: 98,
    lastActive: "2 days ago",
  },
  {
    id: 5,
    title: "Best resources for learning about coffee processing?",
    category: "education",
    author: "NewFarmer",
    avatar: "NF",
    replies: 21,
    views: 143,
    lastActive: "3 days ago",
  },
]

export default function CommunityForumsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter web3-dual-gradient-text-glow">Community Forums</h1>
            <p className="text-muted-foreground">Connect, share, and learn with the WAGA community</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-purple-600/30 hover:border-purple-600/60">
              <Link href="/community/dashboard">Dashboard</Link>
            </Button>
            <Button asChild className="web3-button-purple">
              <Link href="/community/forums/new">
                <Plus className="mr-2 h-4 w-4" /> New Topic
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search forums..." className="pl-10 web3-input" />
          </div>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
            <TabsTrigger value="popular">Popular Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-6">
            <div className="space-y-4">
              {categories.map((category, index) => {
                // Assign different card styles based on category
                let cardClass = "web3-card"
                if (category.id === "web3") cardClass = "web3-card-purple"
                else if (category.id === "coffee") cardClass = "web3-card-blue"
                else if (category.id === "education") cardClass = "web3-card-teal"
                else if (category.id === "summer-camp") cardClass = "web3-card-pink"
                else cardClass = "web3-card-amber"

                return (
                  <Card key={category.id} className={`${cardClass} hover:border-purple-500/40 transition-colors`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            href={`/community/forums/categories/${category.id}`}
                            className="text-lg font-medium hover:text-primary"
                          >
                            {category.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{category.topics} topics</span>
                          </div>
                          <div>
                            <span>{category.posts} posts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="space-y-4">
              {recentTopics.map((topic) => {
                // Assign different card styles based on category
                let cardClass = "web3-card"
                if (topic.category === "web3") cardClass = "web3-card-purple"
                else if (topic.category === "coffee") cardClass = "web3-card-blue"
                else if (topic.category === "education") cardClass = "web3-card-teal"
                else if (topic.category === "summer-camp") cardClass = "web3-card-pink"
                else cardClass = "web3-card-amber"

                return (
                  <Card key={topic.id} className={`${cardClass} hover:border-purple-500/40 transition-colors`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={topic.author} />
                            <AvatarFallback className="bg-purple-900/50">{topic.avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              href={`/community/forums/topics/${topic.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {topic.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300"
                              >
                                {categories.find((c) => c.id === topic.category)?.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">By {topic.author}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">Last active {topic.lastActive}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          >
                            {topic.replies} replies
                          </Badge>
                          <span className="text-xs text-muted-foreground">{topic.views} views</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <div className="space-y-4">
              {recentTopics
                .sort((a, b) => b.views - a.views)
                .map((topic) => {
                  // Assign different card styles based on category
                  let cardClass = "web3-card"
                  if (topic.category === "web3") cardClass = "web3-card-purple"
                  else if (topic.category === "coffee") cardClass = "web3-card-blue"
                  else if (topic.category === "education") cardClass = "web3-card-teal"
                  else if (topic.category === "summer-camp") cardClass = "web3-card-pink"
                  else cardClass = "web3-card-amber"

                  return (
                    <Card key={topic.id} className={`${cardClass} hover:border-purple-500/40 transition-colors`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                              <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={topic.author} />
                              <AvatarFallback className="bg-purple-900/50">{topic.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/community/forums/topics/${topic.id}`}
                                className="font-medium hover:text-primary"
                              >
                                {topic.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300"
                                >
                                  {categories.find((c) => c.id === topic.category)?.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">By {topic.author}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">Last active {topic.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {topic.replies} replies
                            </Badge>
                            <span className="text-xs text-muted-foreground">{topic.views} views</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

