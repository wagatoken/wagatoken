import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, Clock } from "lucide-react"

// Sample events data
const upcomingEvents = [
  {
    id: 1,
    title: "Web3 for Coffee Traceability",
    type: "Webinar",
    date: "May 15, 2024",
    time: "3:00 PM UTC",
    duration: "1 hour",
    speakers: ["Jane Doe", "John Smith"],
    description:
      "Learn how blockchain technology can be used to create transparent and traceable coffee supply chains. We'll cover real-world examples and implementation challenges.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "Community AMA: WAGA Academy Roadmap",
    type: "Live Session",
    date: "May 22, 2024",
    time: "4:00 PM UTC",
    duration: "1.5 hours",
    speakers: ["WAGA Team"],
    description:
      "Join the WAGA Academy team for an Ask Me Anything session about our roadmap, upcoming courses, and the future of the platform.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Coffee Tokenization: Use Cases & Opportunities",
    type: "Workshop",
    date: "June 5, 2024",
    time: "2:00 PM UTC",
    duration: "2 hours",
    speakers: ["Alice Johnson", "Bob Williams"],
    description:
      "Explore how coffee assets can be tokenized to enable fair pricing, financial resources, and global market access for smallholder farmers.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Summer Camp 2024 Information Session",
    type: "Webinar",
    date: "June 12, 2024",
    time: "3:30 PM UTC",
    duration: "1 hour",
    speakers: ["Summer Camp Team"],
    description:
      "Get all the details about the upcoming WAGA Summer Camp in Ethiopia, including dates, logistics, and what to expect as a volunteer.",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const pastEvents = [
  {
    id: 101,
    title: "Introduction to WAGA Academy",
    type: "Webinar",
    date: "April 20, 2024",
    time: "3:00 PM UTC",
    duration: "1 hour",
    speakers: ["WAGA Founders"],
    description:
      "An introduction to WAGA Academy, our mission, and how we're using Web3 to transform the coffee industry.",
    recording: true,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 102,
    title: "DeFi Basics for Coffee Farmers",
    type: "Workshop",
    date: "April 28, 2024",
    time: "2:00 PM UTC",
    duration: "1.5 hours",
    speakers: ["Finance Team"],
    description: "A beginner-friendly introduction to decentralized finance and how it can benefit coffee farmers.",
    recording: true,
    image: "/placeholder.svg?height=200&width=400",
  },
]

export default function CommunityEventsPage() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter web3-dual-gradient-text-glow">Community Events</h1>
            <p className="text-muted-foreground">Join exclusive webinars, workshops, and discussions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-purple-600/30 hover:border-purple-600/60">
              <Link href="/community/dashboard">Dashboard</Link>
            </Button>
            <Button asChild className="web3-button-purple">
              <Link href="/community/events/calendar">Calendar View</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => {
                // Assign different card styles based on type
                let cardClass = "web3-card"
                if (event.type === "Webinar") cardClass = "web3-card-purple"
                else if (event.type === "Live Session") cardClass = "web3-card-blue"
                else if (event.type === "Workshop") cardClass = "web3-card-teal"
                else cardClass = "web3-card-pink"

                return (
                  <Card
                    key={event.id}
                    className={`${cardClass} flex flex-col h-full hover:border-purple-500/40 transition-colors`}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-white">{event.type}</Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.time} • {event.duration}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                      <div className="mt-4">
                        <p className="text-sm font-medium">Speakers:</p>
                        <div className="flex items-center gap-2 mt-1">
                          {event.speakers.map((speaker, index) => (
                            <Badge key={index} variant="outline">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/community/events/${event.id}`}>Register</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastEvents.map((event, index) => {
                // Assign different card styles based on type
                let cardClass = "web3-card"
                if (event.type === "Webinar") cardClass = "web3-card-purple"
                else if (event.type === "Workshop") cardClass = "web3-card-blue"
                else cardClass = "web3-card-teal"

                return (
                  <Card
                    key={event.id}
                    className={`${cardClass} flex flex-col h-full hover:border-purple-500/40 transition-colors`}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary text-white">{event.type}</Badge>
                      </div>
                      {event.recording && (
                        <div className="absolute bottom-2 right-2">
                          <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/20 text-white">
                            <Video className="mr-1 h-3 w-3" /> Recording Available
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.time} • {event.duration}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                      <div className="mt-4">
                        <p className="text-sm font-medium">Speakers:</p>
                        <div className="flex items-center gap-2 mt-1">
                          {event.speakers.map((speaker, index) => (
                            <Badge key={index} variant="outline">
                              {speaker}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full" variant="outline">
                        <Link href={`/community/events/${event.id}`}>View Recording</Link>
                      </Button>
                    </CardFooter>
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

