import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, MapPin, Award, Coffee, Lightbulb, Globe, Heart } from "lucide-react"
import { BlockchainPlaceholder } from "@/components/animations/blockchain-placeholder"

export default function SummerCampPage() {
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
                July - September 2024
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none web3-dual-gradient-text-glow">
                WAGA Summer Camp
              </h1>
              <p className="text-muted-foreground md:text-xl">A Web3 & Coffee Innovation Experience in Ethiopia</p>
              <p className="text-muted-foreground">
                Join our immersive volunteer program in Ethiopia's coffee-producing regions and help empower the next
                generation of smallholder farmers with Web3 technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="web3-button-purple">
                  <Link href="/summer-camp/register">Register Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
                  <Link href="#faq">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden web3-card">
              <BlockchainPlaceholder
                height={500}
                variant="default"
                nodeCount={18}
                alt="WAGA Summer Camp blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Info Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="web3-card-purple">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <CalendarDays className="h-12 w-12 text-purple-400 mb-2" />
                <h3 className="text-xl font-bold">July - September 2024</h3>
                <p className="text-muted-foreground">Flexible 2-4 week volunteer program with multiple start dates</p>
              </CardContent>
            </Card>
            <Card className="web3-card-blue">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <MapPin className="h-12 w-12 text-blue-400 mb-2" />
                <h3 className="text-xl font-bold">Ethiopia</h3>
                <p className="text-muted-foreground">
                  Experience the birthplace of coffee in its coffee-producing regions
                </p>
              </CardContent>
            </Card>
            <Card className="web3-card-teal">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <Users className="h-12 w-12 text-teal-400 mb-2" />
                <h3 className="text-xl font-bold">200+ Farmers</h3>
                <p className="text-muted-foreground">
                  Train the next generation of coffee farmers in Web3 and digital skills
                </p>
              </CardContent>
            </Card>
            <Card className="web3-card-pink">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <Award className="h-12 w-12 text-pink-400 mb-2" />
                <h3 className="text-xl font-bold">WAGA Certification</h3>
                <p className="text-muted-foreground">
                  Receive official recognition for your contribution to the program
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Volunteer Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Why Volunteer?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join us in making a lasting impact on smallholder farmers in Ethiopia's coffee industry
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 w-full pt-8">
              <Card className="web3-card-purple">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <Heart className="h-10 w-10 text-purple-400 mb-2" />
                  <CardTitle className="card-title text-foreground">Make a Real Impact</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Help smallholder farmers access better markets, fair financing, and traceability solutions
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-teal">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <Coffee className="h-10 w-10 text-teal-400 mb-2" />
                  <CardTitle className="card-title text-foreground">Experience Coffee Culture</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Live in Ethiopia's coffee-producing regions, visit farms, and experience the famous Ethiopian coffee
                    ceremony
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-blue">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <Globe className="h-10 w-10 text-blue-400 mb-2" />
                  <CardTitle className="card-title text-foreground">Global Web3 Initiative</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Network with like-minded blockchain pioneers while building real-world Web3 applications
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="web3-card-pink">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                  <Lightbulb className="h-10 w-10 text-pink-400 mb-2" />
                  <CardTitle className="card-title text-foreground">Deeper Understanding</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Learn how blockchain and DeFi can solve real-world economic challenges beyond speculation
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Program Schedule Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Program Schedule & Timeline
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Our structured program ensures a meaningful experience for both volunteers and participants
              </p>
            </div>
            <div className="w-full max-w-3xl pt-8">
              <Tabs defaultValue="phase1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="phase1">Phase 1</TabsTrigger>
                  <TabsTrigger value="phase2">Phase 2</TabsTrigger>
                  <TabsTrigger value="phase3">Phase 3</TabsTrigger>
                  <TabsTrigger value="phase4">Phase 4</TabsTrigger>
                </TabsList>
                <TabsContent value="phase1" className="p-4 border rounded-md mt-2 web3-card-purple">
                  <h3 className="text-lg font-bold web3-gradient-text">Pre-arrival Training & Orientation</h3>
                  <p className="text-muted-foreground mt-2">June 2024</p>
                  <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Virtual orientation sessions</li>
                    <li>Background materials on Ethiopian coffee industry</li>
                    <li>Introduction to the WAGA ecosystem</li>
                    <li>Preparation guidelines and logistics information</li>
                  </ul>
                </TabsContent>
                <TabsContent value="phase2" className="p-4 border rounded-md mt-2 web3-card-blue">
                  <h3 className="text-lg font-bold web3-gradient-text">Onboarding & Cultural Immersion</h3>
                  <p className="text-muted-foreground mt-2">July 2024</p>
                  <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Arrival in Ethiopia and local orientation</li>
                    <li>Coffee farm visits and processing plant tours</li>
                    <li>Cultural experiences and traditional coffee ceremonies</li>
                    <li>Meeting with local farmers and community leaders</li>
                  </ul>
                </TabsContent>
                <TabsContent value="phase3" className="p-4 border rounded-md mt-2 web3-card-teal">
                  <h3 className="text-lg font-bold web3-gradient-text">Hands-on Training & Web3 Implementation</h3>
                  <p className="text-muted-foreground mt-2">July – August 2024</p>
                  <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Teaching farmers about Web3, tokenization, and digital trade</li>
                    <li>Introducing DeFi solutions for yield-based lending</li>
                    <li>Supporting IoT-powered traceability systems</li>
                    <li>Conducting workshops on wallet setup and smart contract use</li>
                  </ul>
                </TabsContent>
                <TabsContent value="phase4" className="p-4 border rounded-md mt-2 web3-card-pink">
                  <h3 className="text-lg font-bold web3-gradient-text">Knowledge Transfer & Closing Ceremony</h3>
                  <p className="text-muted-foreground mt-2">August – September 2024</p>
                  <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Ensuring sustainable knowledge transfer to local trainers</li>
                    <li>Documenting outcomes and success stories</li>
                    <li>Certification ceremony for participants</li>
                    <li>Planning for continued engagement and future programs</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For Section */}
      <section className="w-full py-12 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Who Are We Looking For?
              </h2>
              <p className="text-muted-foreground">
                We welcome volunteers from all backgrounds, particularly those with expertise in:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Blockchain & Web3
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    DeFi & Lending
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Supply Chain & IoT
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Smart Contracts
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Financial Inclusion
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Sustainable Agriculture
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Digital Marketing
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="primary-gradient text-white">
                    Community Building
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground italic mt-4">
                No prior experience in coffee is required – just a passion for impact-driven Web3 solutions!
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="web3-button-purple">
                  <Link href="/summer-camp/register">Apply Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
              <BlockchainPlaceholder
                height={400}
                variant="grid"
                nodeCount={16}
                alt="WAGA Summer Camp Volunteers blockchain visualization"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Find answers to common questions about the WAGA Summer Camp
              </p>
            </div>
            <div className="w-full max-w-3xl pt-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="web3-card-purple mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      Do I need blockchain experience to apply?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    Not necessarily! While Web3/DeFi experience is helpful, we welcome volunteers who have expertise in
                    education, financial inclusion, and technology adoption.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="web3-card-blue mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      Will I be working directly with farmers?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    Yes! Volunteers will work side by side with smallholder farmers, cooperatives, and young trainees in
                    rural coffee communities.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="web3-card-teal mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      What language is the program conducted in?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    The main language of instruction is English, but we will have translators for local languages.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="web3-card-pink mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      What about internet and logistics?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    The program locations will have stable internet access, and logistics are handled by WAGA and local
                    partners.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5" className="web3-card-amber mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      Can I bring a friend or colleague?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    Yes! We encourage group applications, so feel free to apply with a friend or fellow Web3 enthusiast.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6" className="web3-card-emerald mb-4">
                  <AccordionTrigger className="px-2">
                    <span className="text-base text-foreground text-left font-medium">
                      What's included in the program?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 text-muted-foreground">
                    WAGA covers accommodation in coffee-producing regions, local transport within Ethiopia, daily meals,
                    coffee farm visits, and cultural experiences. Volunteers are responsible for their own international
                    travel and visa arrangements.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                Join Us in Transforming the Future of Coffee & Web3!
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                By volunteering at WAGA Summer Camp, you're not just teaching Web3 – you're empowering farmers, shaping
                sustainable economies, and revolutionizing global trade.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="web3-button-purple">
                <Link href="/summer-camp/register">Apply Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Application Deadline: May 15, 2024 | Spots are limited!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

