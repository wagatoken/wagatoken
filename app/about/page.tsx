import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Coffee, Globe, Users, Lightbulb, Target, Leaf, Shield, Coins, BookOpen, Calendar } from "lucide-react"
import { BlockchainPlaceholder } from "@/components/animations/blockchain-placeholder"

// Update the team members section to use Lorem Ipsum for bios
const teamMembers = [
  {
    name: "John Doe",
    role: "Founder & Executive Director",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    avatar: "JD",
  },
  {
    name: "Jane Doe",
    role: "Head of Web3 Education",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    avatar: "JD",
  },
  {
    name: "Alice Smith",
    role: "Coffee Value Chain Lead",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    avatar: "AS",
  },
  {
    name: "Bob Johnson",
    role: "DeFi & Financial Inclusion Specialist",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    avatar: "BJ",
  },
  {
    name: "Carol Williams",
    role: "Community Engagement Director",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    avatar: "CW",
  },
  {
    name: "David Brown",
    role: "Technology & Innovation Lead",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni.",
    avatar: "DB",
  },
]

// Update the partners section to use placeholder names
const partners = [
  {
    name: "Partner Organization Alpha",
    type: "Government",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Partner Organization Beta",
    type: "Technology",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Partner Organization Gamma",
    type: "Industry",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Partner Organization Delta",
    type: "Non-Profit",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Partner Organization Epsilon",
    type: "Finance",
    logo: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Partner Organization Zeta",
    type: "Non-Profit",
    logo: "/placeholder.svg?height=80&width=80",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-sm text-purple-300">
                Our Story
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none web3-dual-gradient-text-glow">
                About WAGA Academy
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Bridging the gap between traditional coffee farming and Web3 innovation
              </p>
              <p className="text-muted-foreground">
                WAGA Academy was founded with a vision to transform the coffee industry through education, technology,
                and community empowerment. We're building a future where smallholder farmers have direct access to
                global markets, fair financing, and the tools to thrive in a digital economy.
              </p>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden web3-card-featured">
              <BlockchainPlaceholder
                height="100%"
                variant="circular"
                nodeCount={25}
                alt="WAGA Academy Team blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="w-full py-12 md:py-24 bg-black/30 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                <h2 className="text-2xl font-bold web3-gradient-text">Our Mission</h2>
              </div>
              <p className="text-muted-foreground">
                To provide accessible and specialized training to youth and professionals in the coffee industry,
                equipping them with the knowledge and skills needed to leverage Web3 technologies for improved
                livelihoods, transparent supply chains, and sustainable practices.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-purple-500/10 p-1 mt-1">
                    <Coffee className="h-4 w-4 text-purple-400" />
                  </div>
                  <span>Empower smallholder farmers with digital skills and Web3 knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-blue-500/10 p-1 mt-1">
                    <Coins className="h-4 w-4 text-blue-400" />
                  </div>
                  <span>Create financial inclusion through DeFi and tokenization</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-teal-500/10 p-1 mt-1">
                    <Globe className="h-4 w-4 text-teal-400" />
                  </div>
                  <span>Build transparent and traceable coffee supply chains</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-400" />
                <h2 className="text-2xl font-bold web3-gradient-text">Our Vision</h2>
              </div>
              <p className="text-muted-foreground">
                A world where coffee farmers are empowered through technology, where the coffee value chain is
                transparent and equitable, and where communities thrive through sustainable practices and fair trade
                enabled by Web3 innovation.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-pink-500/10 p-1 mt-1">
                    <Users className="h-4 w-4 text-pink-400" />
                  </div>
                  <span>Create a global community of digitally-empowered coffee producers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-500/10 p-1 mt-1">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Promote sustainable and regenerative coffee farming practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-amber-500/10 p-1 mt-1">
                    <Shield className="h-4 w-4 text-amber-400" />
                  </div>
                  <span>Ensure fair compensation and market access for all value chain participants</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Our Core Values
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The principles that guide everything we do at WAGA Academy
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full pt-8">
              <Card className="web3-card-purple">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-purple-500/10 p-4">
                      <Users className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                  <CardTitle>Community First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    We prioritize the needs of coffee-growing communities and build solutions that address their real
                    challenges.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-blue">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-blue-500/10 p-4">
                      <Leaf className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  <CardTitle>Sustainability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    We promote environmentally responsible practices throughout the coffee value chain and in our
                    operations.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-teal">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-teal-500/10 p-4">
                      <Shield className="h-8 w-8 text-teal-400" />
                    </div>
                  </div>
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    We believe in open, traceable systems that build trust and accountability across the coffee
                    ecosystem.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-pink">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-pink-500/10 p-4">
                      <Lightbulb className="h-8 w-8 text-pink-400" />
                    </div>
                  </div>
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-400">
                    We embrace cutting-edge technologies and creative solutions to transform traditional coffee
                    production.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="w-full py-12 md:py-24 bg-black/30 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Meet Our Team
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                A diverse group of experts passionate about coffee, technology, and community development
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full pt-8">
              {teamMembers.map((member, index) => {
                // Assign different card styles based on index
                const cardClasses = [
                  "web3-card-purple",
                  "web3-card-blue",
                  "web3-card-teal",
                  "web3-card-pink",
                  "web3-card-amber",
                  "web3-card-emerald",
                ]
                const cardClass = cardClasses[index % cardClasses.length]

                return (
                  <Card key={index} className={`${cardClass}`}>
                    <CardHeader className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4 ring-2 ring-purple-500/30">
                        <AvatarImage src={`/placeholder.svg?height=96&width=96`} alt={member.name} />
                        <AvatarFallback className="bg-purple-900/50 text-xl">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription className="text-primary">{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">{member.bio}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">Our Roadmap</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our strategic plan for building and growing WAGA Academy
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-600 to-indigo-600"></div>

            <div className="space-y-12 relative">
              {/* Q1 2025 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="web3-card-purple p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q1 2025</h3>
                    <p className="text-muted-foreground">
                      Launch of WAGA Academy platform with initial course offerings focused on Web3 fundamentals and
                      coffee value chain basics.
                    </p>
                  </div>
                </div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="md:w-1/2 md:pl-12 invisible md:visible"></div>
              </div>

              {/* Q2 2025 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 invisible md:visible"></div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="web3-card-blue p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q2 2025</h3>
                    <p className="text-muted-foreground">
                      Development of comprehensive curriculum for coffee value chain education, with specialized modules
                      on blockchain integration and sustainable farming practices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Q3 2025 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="web3-card-teal p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q3 2025</h3>
                    <p className="text-muted-foreground">
                      First WAGA Summer Camp in Ethiopia, training 100 farmers in blockchain traceability and digital
                      skills, with hands-on workshops and community-based learning.
                    </p>
                  </div>
                </div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="md:w-1/2 md:pl-12 invisible md:visible"></div>
              </div>

              {/* Q4 2025 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 invisible md:visible"></div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">4</span>
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="web3-card-pink p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q4 2025</h3>
                    <p className="text-muted-foreground">
                      Implementation of pilot DeFi lending program alongside financial literacy training for coffee
                      cooperatives, using future yield as collateral.
                    </p>
                  </div>
                </div>
              </div>

              {/* Q1-Q2 2026 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <div className="web3-card-amber p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q1-Q2 2026</h3>
                    <p className="text-muted-foreground">
                      Launch of blockchain-based traceability system with comprehensive training programs, connecting
                      500+ farmers to global markets while building technical capacity.
                    </p>
                  </div>
                </div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">5</span>
                </div>
                <div className="md:w-1/2 md:pl-12 invisible md:visible"></div>
              </div>

              {/* Q3-Q4 2026 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 invisible md:visible"></div>
                <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary shadow-glow">
                  <span className="text-white font-bold">6</span>
                </div>
                <div className="md:w-1/2 md:pl-12 mb-4 md:mb-0">
                  <div className="web3-card-emerald p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Q3-Q4 2026</h3>
                    <p className="text-muted-foreground">
                      Establishment of Farmer Schools in key coffee-producing regions, formal partnerships with
                      universities and training centers, and expansion of educational programs across Africa and Latin
                      America.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="w-full py-12 md:py-24 bg-black/30 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">Our Partners</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Collaborating with organizations across sectors to create lasting impact
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 w-full pt-8">
              {partners.map((partner, index) => {
                // Assign different card styles based on index
                const bgClasses = [
                  "bg-purple-500/10 border-purple-500/30",
                  "bg-blue-500/10 border-blue-500/30",
                  "bg-teal-500/10 border-teal-500/30",
                  "bg-pink-500/10 border-pink-500/30",
                  "bg-amber-500/10 border-amber-500/30",
                  "bg-emerald-500/10 border-emerald-500/30",
                ]
                const bgClass = bgClasses[index % bgClasses.length]

                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div
                      className={`h-24 w-24 rounded-lg ${bgClass} backdrop-blur flex items-center justify-center p-4`}
                    >
                      <BlockchainPlaceholder
                        height={80}
                        width={80}
                        variant={index % 2 === 0 ? "circular" : "grid"}
                        nodeCount={8}
                        alt={partner.name}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-center">{partner.name}</p>
                      <p className="text-xs text-muted-foreground text-center">{partner.type}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Projected Impact
              </h2>
              <p className="text-muted-foreground">
                WAGA Academy aims to create measurable, positive change in coffee-producing communities through
                education and technology. Here's the impact we project to make in the coming years:
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="web3-card-purple p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">1,000+</div>
                  <p className="text-sm text-muted-foreground">Students to Train</p>
                </div>
                <div className="web3-card-blue p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">10+</div>
                  <p className="text-sm text-muted-foreground">Countries to Reach</p>
                </div>
                <div className="web3-card-teal p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-teal-400 mb-2">25+</div>
                  <p className="text-sm text-muted-foreground">Community Projects</p>
                </div>
                <div className="web3-card-pink p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">40%</div>
                  <p className="text-sm text-muted-foreground">Target Income Increase</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Tabs defaultValue="stories">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stories">Vision for Impact</TabsTrigger>
                  <TabsTrigger value="goals">Future Goals</TabsTrigger>
                </TabsList>
                <TabsContent value="stories" className="p-4 border rounded-md mt-2 web3-card-purple">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 mt-1 ring-2 ring-purple-500/30">
                        <AvatarFallback className="bg-purple-900/50">CF</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Coffee Farmers</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          "We envision farmers implementing blockchain traceability to receive 40% more for their coffee
                          beans. Buyers will trust the quality and be willing to pay premium prices."
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 mt-1 ring-2 ring-purple-500/30">
                        <AvatarFallback className="bg-purple-900/50">CL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Cooperative Leaders</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          "Cooperatives will access DeFi loans using their future yield as collateral. This will allow
                          them to invest in better processing equipment and increase quality."
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="goals" className="p-4 border rounded-md mt-2 web3-card-blue">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-500/10 p-1 mt-1">
                        <Target className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Train 5,000+ farmers and youth in Web3 technologies by 2026</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-500/10 p-1 mt-1">
                        <Target className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Expand the Summer Camp program to 5 additional coffee-producing countries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-500/10 p-1 mt-1">
                        <Target className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Develop a comprehensive DeFi lending platform specifically for coffee farmers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-500/10 p-1 mt-1">
                        <Target className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Create a global marketplace for tokenized coffee with direct farmer-to-consumer sales</span>
                    </li>
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-black/30 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Join Our Mission
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Be part of the movement to transform the coffee industry through Web3 technology and education
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 w-full max-w-3xl pt-8">
              <Card className="web3-card-purple">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-purple-400" />
                  </div>
                  <CardTitle>Take a Course</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Expand your knowledge of coffee and Web3 technologies
                  </p>
                  <Button asChild className="web3-button-purple w-full">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="web3-card-blue">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle>Volunteer</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your expertise at our Summer Camp in Ethiopia
                  </p>
                  <Button asChild className="web3-button-purple w-full">
                    <Link href="/summer-camp/register">Apply Now</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="web3-card-teal">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Users className="h-8 w-8 text-teal-400" />
                  </div>
                  <CardTitle>Partner With Us</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Collaborate on initiatives to transform the coffee industry
                  </p>
                  <Button asChild className="web3-button-purple w-full">
                    <Link href="/contact" scroll={true}>
                      Get in Touch
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

