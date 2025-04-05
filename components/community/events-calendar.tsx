"use client"

import { useCommunity } from "@/context/community-context"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { Calendar, Video, Users, Bell } from "lucide-react"
import Link from "next/link"

export function EventsCalendar() {
  const { events, registerForEvent } = useCommunity()

  return (
    <DynamicGlowCard variant="purple" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-purple-300">Upcoming Events</h2>
        <Link href="/community/events" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-6 px-4 bg-black/30 border border-purple-500/10 rounded-md">
            <Calendar className="h-10 w-10 text-purple-400/70 mx-auto mb-3" />
            <p className="text-gray-300 font-medium mb-2">No upcoming events</p>
            <p className="text-sm text-gray-400 mb-4">We're planning our first community events. Stay tuned!</p>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/30 hover:bg-purple-900/30 hover:border-purple-500/50 text-purple-300"
            >
              <Bell className="h-4 w-4 mr-2" />
              Get notified
            </Button>
          </div>
        ) : (
          events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-md bg-black/30 border border-purple-500/10 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="bg-purple-900/50 p-2 rounded-md mr-3">
                  <Calendar className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-300">{event.date}</p>
                  <p className="text-xs text-gray-400">
                    {event.time} ({event.duration} min)
                  </p>
                </div>
              </div>

              <h3 className="font-medium text-gray-200 mb-1">{event.title}</h3>

              <div className="flex items-center text-xs text-gray-400 mb-3">
                <div className="flex items-center mr-3">
                  <Video className="h-3 w-3 mr-1" />
                  <span>{event.type}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  <span>
                    {event.registeredCount}/{event.capacity}
                  </span>
                </div>
              </div>

              {event.isRegistered ? (
                <Button variant="outline" size="sm" className="w-full border-purple-500/30 text-purple-300" disabled>
                  Registered
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-purple-500/30 hover:bg-purple-900/30 hover:border-purple-500/50 text-purple-300"
                  onClick={() => registerForEvent(event.id)}
                >
                  Register
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </DynamicGlowCard>
  )
}

