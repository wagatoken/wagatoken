import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Download, Coffee, Globe, Lightbulb, Search, BookOpen, Leaf, Coins } from "lucide-react"

// Sample resources data
const resources = [
  {
    id: 1,
    title: "Blockchain for Agriculture: A Primer",
    type: "PDF Guide",
    category: "Web3 & Blockchain",
    description:
      "An introduction to blockchain technology and its applications in agriculture, with a focus on coffee supply chains.",
    icon: <Globe className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: true,
  },
  {
    id: 2,
    title: "Coffee Value Chain Explained",
    type: "Video Series",
    category: "Coffee Industry",
    description:
      "A comprehensive overview of the coffee value chain, from farm to cup, with insights into each stage of production and distribution.",
    icon: <Coffee className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: false,
  },
  {
    id: 3,
    title: "Setting Up a Crypto Wallet",
    type: "Tutorial",
    category: "Web3 & Blockchain",
    description: "Step-by-step guide to setting up and securing a cryptocurrency wallet for beginners.",
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: true,
  },
  {
    id: 4,
    title: "Sustainable Coffee Farming Practices",
    type: "E-Book",
    category: "Coffee Cultivation",
    description:
      "A comprehensive guide to sustainable coffee farming practices, including agroforestry, water conservation, and organic pest management techniques.",
    icon: <Leaf className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: true,
  },
  {
    id: 5,
    title: "Introduction to DeFi for Coffee Farmers",
    type: "Presentation",
    category: "Finance & Accounting",
    description:
      "An overview of decentralized finance and how it can provide financial inclusion and opportunities for coffee farmers.",
    icon: <Coins className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: true,
  },
  {
    id: 6,
    title: "WAGA Academy Course Preview: Blockchain Traceability",
    type: "Course Preview",
    category: "Education & Training",
    description: "A preview of our upcoming course on implementing blockchain traceability in coffee supply chains.",
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    image: "/placeholder.svg?height=200&width=400",
    downloadable: false,
  },
]

// Resource categories
const categories = [
  "All",
  "Web3 & Blockchain",
  "Coffee Industry",
  "Coffee Cultivation",
  "Finance & Accounting",
  "Education & Training",
]

export default function ResourcesPage() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter web3-dual-gradient-text-glow">Community Resources</h1>
            <p className="text-muted-foreground">Exclusive content for WAGA Early Access Community members</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-purple-600/30 hover:border-purple-600/60">
              <Link href="/community/dashboard">Dashboard</Link>
            </Button>
            <Button asChild className="web3-button-purple">
              <Link href="/community/resources/bookmarks">My Bookmarks</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resources..." className="pl-10" />
          </div>
        </div>

        <Tabs defaultValue="All" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="mb-1">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .filter((resource) => category === "All" || resource.category === category)
                  .map((resource, index) => {
                    // Assign different card styles based on category
                    let cardClass = "web3-card"
                    if (resource.category === "Web3 & Blockchain") cardClass = "web3-card-purple"
                    else if (resource.category === "Coffee Industry") cardClass = "web3-card-blue"
                    else if (resource.category === "Coffee Cultivation") cardClass = "web3-card-teal"
                    else if (resource.category === "Finance & Accounting") cardClass = "web3-card-amber"
                    else if (resource.category === "Education & Training") cardClass = "web3-card-pink"

                    return (
                      <Card
                        key={resource.id}
                        className={`${cardClass} flex flex-col h-full hover:border-purple-500/40 transition-colors`}
                      >
                        <div className="relative h-48 w-full">
                          <Image
                            src={resource.image || "/placeholder.svg"}
                            alt={resource.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary text-white">{resource.type}</Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-md">{resource.icon}</div>
                            <CardTitle className="text-xl">{resource.title}</CardTitle>
                          </div>
                          <CardDescription>
                            <Badge variant="outline" className="mt-2">
                              {resource.category}
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 flex-grow">
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full web3-button-purple">
                            <Link href={`/community/resources/${resource.id}`}>
                              {resource.downloadable ? (
                                <>
                                  <Download className="mr-2 h-4 w-4" /> Download
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" /> View Resource
                                </>
                              )}
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

