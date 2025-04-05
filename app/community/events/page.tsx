"use client"

import { motion } from "framer-motion"
import { useCommunity } from "@/context/community-context"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { Users, Filter, Plus, MapPin, Clock, Bell } from "lucide-react"
import Link from "next/link"

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function EventsPage() {
  const { events, registerForEvent } = useCommunity()

  // Add more mock events for the page
  const allEvents = [
    ...events,
    {
      id: "event-3",
      title: "Coffee Tokenization Workshop",
      description: "A hands-on workshop exploring the technical aspects of tokenizing coffee assets on the blockchain.",
      type: "workshop",
      date: "2023-12-05",
      time: "14:00",
      duration: 120,
      location: "Virtual",
      speakers: [
        {
          id: "speaker-3",
          name: "Michael Ochieng",
          avatar: "/placeholder.svg?height=60&width=60",
          bio: "Blockchain Developer at WAGA Protocol",
        },
      ],
      registeredCount: 32,
      capacity: 100,
      isRegistered: false,
    },
    {
      id: "event-4",
      title: "Coffee Industry Meetup",
      description:
        "Connect with coffee industry professionals and blockchain enthusiasts to discuss the future of coffee trade.",
      type: "conference",
      date: "2023-12-15",
      time: "10:00",
      duration: 240,
      location: "Addis Ababa, Ethiopia",
      speakers: [
        {
          id: "speaker-4",
          name: "Sarah Ahmed",
          avatar: "/placeholder.svg?height=60&width=60",
          bio: "Coffee Industry Consultant",
        },
        {
          id: "speaker-5",
          name: "David Wilson",
          avatar: "/placeholder.svg?height=60&width=60",
          bio: "CEO of Global Coffee Trade",
        },
      ],
      registeredCount: 78,
      capacity: 150,
      isRegistered: false,
    },
    {
      id: "event-5",
      title: "WAGA Protocol Q4 Update",
      description: "Quarterly update on the development progress, roadmap, and upcoming features of WAGA Protocol.",
      type: "webinar",
      date: "2023-12-20",
      time: "16:00",
      duration: 60,
      location: "Virtual",
      speakers: [
        {
          id: "speaker-6",
          name: "Daniel Kimathi",
          avatar: "/placeholder.svg?height=60&width=60",
          bio: "Lead Developer at WAGA Protocol",
        },
      ],
      registeredCount: 125,
      capacity: 500,
      isRegistered: true,
    },
  ]

  // Update the categories to show more realistic counts with zeros
  const categories = [
    { name: "All", count: allEvents.length },
    { name: "Webinars", count: 0 },
    { name: "Workshops", count: 0 },
    { name: "AMAs", count: 0 },
    { name: "Conferences", count: 0 },
  ]

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Community Events"
        description="Join webinars, workshops, and conferences to learn and connect with the community"
      />

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div className="w-full md:w-auto flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className={index === 0 ? "bg-gradient-to-r from-emerald-600 to-purple-600" : "border-emerald-500/30"}
            >
              {category.name}
              <span className="ml-2 bg-black/30 px-1.5 py-0.5 rounded-full text-xs">{category.count}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="border-emerald-500/30">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-emerald-600 to-purple-600 ml-auto md:ml-0">
            <Plus className="h-4 w-4 mr-2" />
            <Link href="/community/events/create">Create Event</Link>
          </Button>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {allEvents.length === 0 ? (
          <motion.div variants={fadeIn} className="col-span-full">
            <DynamicGlowCard variant="emerald" className="p-8 text-center">
              <h3 className="text-xl font-medium text-emerald-300 mb-4">No events scheduled yet</h3>
              <p className="text-gray-400 mb-6">
                We're currently planning our first community events. Check back soon for webinars, workshops, and more!
              </p>
              <Button className="bg-gradient-to-r from-emerald-600 to-purple-600">
                <Bell className="h-4 w-4 mr-2" />
                Get notified about new events
              </Button>
            </DynamicGlowCard>
          </motion.div>
        ) : (
          allEvents.map((event, index) => (
            <motion.div key={event.id} variants={fadeIn}>
              <DynamicGlowCard variant={index % 2 === 0 ? "emerald" : "purple"} className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-black/30 px-3 py-1 rounded-full text-xs text-emerald-300 border border-emerald-500/20 uppercase">
                    {event.type}
                  </div>
                  <div className="text-sm font-medium text-gray-300">{event.date}</div>
                </div>

                <h3 className="text-lg font-medium text-gray-200 mb-2">{event.title}</h3>
                <p className="text-sm text-gray-400 mb-4 flex-grow">{event.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-2 text-emerald-400" />
                    <span>
                      {event.time} ({event.duration} min)
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-400" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="h-4 w-4 mr-2 text-emerald-400" />
                    <span>
                      {event.registeredCount}/{event.capacity} registered
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center mb-4">
                    {event.speakers.slice(0, 2).map((speaker) => (
                      <img
                        key={speaker.id}
                        src={speaker.avatar || "/placeholder.svg"}
                        alt={speaker.name}
                        className="h-8 w-8 rounded-full border border-emerald-500/30 -ml-2 first:ml-0"
                      />
                    ))}
                    {event.speakers.length > 2 && (
                      <div className="h-8 w-8 rounded-full bg-black/50 border border-emerald-500/30 -ml-2 flex items-center justify-center text-xs text-emerald-300">
                        +{event.speakers.length - 2}
                      </div>
                    )}
                    <span className="ml-2 text-xs text-gray-400">{event.speakers.map((s) => s.name).join(", ")}</span>
                  </div>

                  {event.isRegistered ? (
                    <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-300" disabled>
                      Registered
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full bg-gradient-to-r from-emerald-600 to-purple-600"
                      onClick={() => registerForEvent(event.id)}
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </DynamicGlowCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

