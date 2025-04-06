import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Coffee,
  Truck,
  Factory,
  ShoppingBag,
  BarChart3,
  Laptop,
  Coins,
  LineChart,
  Users,
  Leaf,
  Award,
} from "lucide-react"
import { BlockchainPlaceholder } from "@/components/animations/blockchain-placeholder"

export default function AcademyPage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Empowering the Future of Coffee
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none web3-dual-gradient-text-glow">
                WAGA Academy
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Specialized training for the coffee value chain with a focus on Web3 and blockchain technology
              </p>
              <p className="text-muted-foreground">
                The WAGA Academy provides accessible and specialized training to youth and professionals aiming to work
                in the coffee industry, with a focus on the WAGA ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="web3-button-purple">
                  <Link href="/courses">Browse Courses</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
                  <Link href="/register">Join Academy</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <BlockchainPlaceholder
                height="100%"
                variant="circular"
                nodeCount={20}
                alt="WAGA Academy blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">Our Vision</h2>
              <p className="text-muted-foreground">
                The WAGA Academy is critical to the achievement of WAGA's objectives and is designed to provide
                accessible and specialized training to youth and professionals aiming to work in the coffee industry.
                With a focus on the WAGA ecosystem, this academy covers skills required across the coffee supply chain,
                from farm to cup, ensuring participants are equipped to contribute to a fully integrated and sustainable
                coffee industry.
              </p>
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2">
                  <Badge className="primary-gradient text-white">Empower Communities</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Developing a skilled workforce for the WAGA ecosystem in coffee-producing regions
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="primary-gradient text-white">Comprehensive Training</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Covering IT, Supply Chain Management, Finance, Marketing, and Web3 in the coffee industry
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge className="primary-gradient text-white">Sustainable Production</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ensuring traceability and ethical practices from farm to cup
                </p>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
              <BlockchainPlaceholder
                height="100%"
                variant="default"
                nodeCount={15}
                alt="WAGA Academy Vision blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Global Value Chain Approach */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Global Value Chain Approach
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Our curriculum is structured around the coffee value chain, providing comprehensive training for every
                stage from farm to cup
              </p>
            </div>
            <div className="w-full max-w-4xl pt-8">
              <Tabs defaultValue="cultivation" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
                  <TabsTrigger value="processing">Processing</TabsTrigger>
                  <TabsTrigger value="logistics">Logistics</TabsTrigger>
                  <TabsTrigger value="roasting">Roasting</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                </TabsList>
                <TabsContent value="cultivation" className="p-4 border rounded-md mt-2 web3-card-teal">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <Coffee className="h-12 w-12 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold web3-gradient-text">Coffee Cultivation</h3>
                      <p className="text-muted-foreground mt-2">
                        Learn about sustainable farming practices, agroecology, smart farming tools, and blockchain for
                        production data traceability.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-300">
                            Sustainable Farming
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-300">
                            Blockchain Traceability
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-300">
                            Smart Farming Tools
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-500/10 border-teal-500/30 text-teal-300">
                            Yield Optimization
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="processing" className="p-4 border rounded-md mt-2 web3-card-blue">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <Factory className="h-12 w-12 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold web3-gradient-text">Coffee Processing</h3>
                      <p className="text-muted-foreground mt-2">
                        Develop skills in grading, processing methods, inventory management, and supply chain best
                        practices for efficient storage and processing.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            Quality Control
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            Processing Methods
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            Inventory Management
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
                            FIFO Practices
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="logistics" className="p-4 border rounded-md mt-2 web3-card-amber">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <Truck className="h-12 w-12 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold web3-gradient-text">Logistics & Distribution</h3>
                      <p className="text-muted-foreground mt-2">
                        Gain expertise in international trade, logistics management, export regulations, and blockchain
                        for real-time shipment tracking.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300">
                            Procurement
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300">
                            Export Compliance
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300">
                            Blockchain Tracking
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-300">
                            Supply Chain Transparency
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="roasting" className="p-4 border rounded-md mt-2 web3-card-pink">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <ShoppingBag className="h-12 w-12 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold web3-gradient-text">Roasting & Branding</h3>
                      <p className="text-muted-foreground mt-2">
                        Hone your skills in roasting techniques, digital marketing, brand building, and engaging
                        consumers with traceable, tokenized coffee.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300">
                            Roasting Techniques
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300">
                            Digital Marketing
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300">
                            Brand Trust
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-300">
                            Consumer Engagement
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="sales" className="p-4 border rounded-md mt-2 web3-card-purple">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-12 w-12 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold web3-gradient-text">Sales & Distribution</h3>
                      <p className="text-muted-foreground mt-2">
                        Learn how to sell coffee directly to consumers using digital platforms and blockchain for
                        product authenticity and transparency.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            E-commerce
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            Online Sales
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            Product Authenticity
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-300">
                            Customer Transparency
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* General Skills Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                General Skills Across the Coffee Value Chain
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                In addition to role-specific training, we offer courses on cross-cutting skills essential for success in
                the coffee industry
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5 w-full pt-8">
              <Card className="web3-card-purple">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Laptop className="h-10 w-10 text-purple-400" />
                  </div>
                  <CardTitle>Web3 & IT Infrastructure</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Learn how to develop blockchain-based traceability systems for coffee from farm to cup
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-amber">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Truck className="h-10 w-10 text-amber-400" />
                  </div>
                  <CardTitle>Supply Chain Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Gain comprehensive knowledge in logistics, procurement, and distribution across the value chain
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-blue">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Coins className="h-10 w-10 text-blue-400" />
                  </div>
                  <CardTitle>Finance & Accounting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Develop understanding of blockchain-based payments, financial reporting, and accounting systems
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-pink">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <LineChart className="h-10 w-10 text-pink-400" />
                  </div>
                  <CardTitle>Marketing & Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Build expertise in branding, customer loyalty, and positioning of tokenized coffee for global
                    markets
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-teal">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Leaf className="h-10 w-10 text-teal-400" />
                  </div>
                  <CardTitle>Sustainability & Ethics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Promote ethical sourcing and transparency throughout the coffee supply chain
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Training Delivery Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Training Delivery
              </h2>
              <p className="text-muted-foreground">
                We offer multiple learning formats to accommodate different needs and learning styles, ensuring our
                training is accessible to all.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-full">
                    <Laptop className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Online Learning</h3>
                    <p className="text-muted-foreground">
                      Accessible learning modules for wider reach, especially in remote areas
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">In-Person Workshops</h3>
                    <p className="text-muted-foreground">
                      Hands-on, real-world learning experiences in key areas of the coffee value chain
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-teal-500/10 p-3 rounded-full">
                    <Coffee className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Summer Camp</h3>
                    <p className="text-muted-foreground">
                      Immersive volunteer-driven training program in Ethiopia's coffee-producing regions
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-pink-500/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Mentorship & Internships</h3>
                    <p className="text-muted-foreground">
                      Real-world exposure with WAGA and partners to gain industry experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
              <BlockchainPlaceholder
                height="100%"
                variant="grid"
                nodeCount={16}
                alt="WAGA Academy Training blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WAGAToken Integration */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden order-2 lg:order-1">
              <BlockchainPlaceholder
                height="100%"
                variant="circular"
                nodeCount={12}
                alt="WAGAToken Integration blockchain visualization"
              />
            </div>
            <div className="space-y-4 order-1 lg:order-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Integration with WAGAToken
              </h2>
              <p className="text-muted-foreground">
                The WAGA Academy is deeply integrated with the WAGAToken ecosystem, providing incentives and
                opportunities for all participants.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-purple-500/10 p-3 rounded-full">
                    <Laptop className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Access to Training</h3>
                    <p className="text-muted-foreground">
                      WAGAToken will be used to grant access to educational resources
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-blue-500/10 p-3 rounded-full">
                    <Award className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Rewards for Educators</h3>
                    <p className="text-muted-foreground">
                      Token compensation for mentors and educators contributing to the academy
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 bg-teal-500/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Career Pathways</h3>
                    <p className="text-muted-foreground">
                      Graduates will have the opportunity to be employed within the WAGA ecosystem
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Join the WAGA Academy Today
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Whether you're looking to enhance your skills in the coffee industry or contribute as a volunteer,
                there's a place for you at WAGA Academy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="web3-button-purple">
                <Link href="/courses">Explore Courses</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
                <Link href="/summer-camp">Join Summer Camp</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

