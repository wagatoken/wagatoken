import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Users, Calendar, BookOpen } from "lucide-react"

export default function CommunityWelcomePage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl web3-gradient-text">
            Welcome to the Community!
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            You're now part of the WAGA Early Access Community. Here's what you can do next:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="web3-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Connect</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Introduce yourself in the community forums and connect with like-minded enthusiasts from around the
                world.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/community/forums">Visit Forums</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="web3-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Participate</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Join upcoming webinars, workshops, and discussions about Web3, coffee, and the future of the industry.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/community/events">View Events</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="web3-card">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Learn</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Access exclusive resources, guides, and early previews of course materials before the official launch.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/community/resources">Explore Resources</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-black/40 border border-purple-600/30 hover:border-purple-600/60 backdrop-blur rounded-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold web3-gradient-text">Community Benefits</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Early access to course previews and educational content</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Exclusive webinars and workshops with industry experts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Direct input on curriculum development and platform features</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>Priority registration for the Summer Camp program</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[200px] sm:h-[300px] rounded-xl overflow-hidden">
              <Image src="/placeholder.svg?height=300&width=500" alt="WAGA Community" fill className="object-cover" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="web3-button-purple">
            <Link href="/community/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

