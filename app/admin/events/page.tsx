"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Edit, Plus, Search, Trash2, MapPin, Users, Tag } from "lucide-react"
import Link from "next/link"

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Summer Camp Registration",
    date: "2024-06-15",
    location: "Virtual",
    type: "Registration",
    attendees: 42,
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Blockchain for Coffee Workshop",
    date: "2024-05-20",
    location: "Nairobi, Kenya",
    type: "Workshop",
    attendees: 28,
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Supply Chain Transparency Webinar",
    date: "2024-04-10",
    location: "Virtual",
    type: "Webinar",
    attendees: 156,
    status: "Completed",
  },
  {
    id: 4,
    title: "Coffee Farmers Meetup",
    date: "2024-07-05",
    location: "Addis Ababa, Ethiopia",
    type: "Meetup",
    attendees: 0,
    status: "Draft",
  },
  {
    id: 5,
    title: "Web3 Integration Conference",
    date: "2024-08-12",
    location: "Kigali, Rwanda",
    type: "Conference",
    attendees: 0,
    status: "Planning",
  },
]

export default function EventsAdmin() {
  const [events, setEvents] = useState(mockEvents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "" || statusFilter === "all" || event.status === statusFilter
    const matchesType = typeFilter === "" || typeFilter === "all" || event.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleDelete = (id: number) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Workshop":
        return "text-blue-500"
      case "Webinar":
        return "text-purple-500"
      case "Conference":
        return "text-emerald-500"
      case "Meetup":
        return "text-amber-500"
      case "Registration":
        return "text-rose-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold web3-gradient-text">Events Management</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Create, edit, and manage community events
          </p>
        </div>
        <Button className="web3-button-purple w-full sm:w-auto" asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>

      <Card className="border border-purple-500/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
          <CardTitle>Filter Events</CardTitle>
          <CardDescription>Search and filter the events calendar</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search events..."
                className="pl-8 border-purple-500/30 focus-visible:ring-purple-500/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Meetup">Meetup</SelectItem>
                  <SelectItem value="Registration">Registration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden border-purple-600/30 hover:border-purple-600/60 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-3 md:p-4 flex items-center justify-center md:w-24">
                <Calendar className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
              </div>
              <div className="flex-1 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base md:text-lg">{event.title}</h3>
                      <span
                        className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${
                          event.status === "Upcoming"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : event.status === "Completed"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-blue-500" /> {event.date}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-rose-500" /> {event.location}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 md:space-x-4 flex-wrap">
                      <span className={`text-xs md:text-sm flex items-center ${getEventTypeColor(event.type)}`}>
                        <Tag className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" /> {event.type}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-green-500" />
                        {event.attendees > 0 ? `${event.attendees} attendees` : "No attendees yet"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 self-end md:self-start mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                      asChild
                    >
                      <Link href={`/admin/events/${event.id}`}>
                        <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                        <span className="hidden md:inline">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      className="bg-red-500/90 hover:bg-red-600 h-8 w-8 md:w-auto md:px-3"
                    >
                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="hidden md:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

