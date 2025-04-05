"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Trash } from "lucide-react"
import Link from "next/link"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function CreateEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("webinar")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [location, setLocation] = useState("Virtual")
  const [capacity, setCapacity] = useState("100")
  const [speakers, setSpeakers] = useState([{ name: "", bio: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSpeaker = () => {
    setSpeakers([...speakers, { name: "", bio: "" }])
  }

  const handleRemoveSpeaker = (index: number) => {
    const newSpeakers = [...speakers]
    newSpeakers.splice(index, 1)
    setSpeakers(newSpeakers)
  }

  const handleSpeakerChange = (index: number, field: string, value: string) => {
    const newSpeakers = [...speakers]
    newSpeakers[index] = { ...newSpeakers[index], [field]: value }
    setSpeakers(newSpeakers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !date || !time) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Redirect to events page after submission
      router.push("/community/events")
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Create Event"
        description="Organize webinars, workshops, and conferences for the community"
      />

      <div className="mb-6">
        <Link href="/community/events">
          <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <DynamicGlowCard variant="emerald" className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="type" className="block text-sm font-medium text-emerald-300 mb-2">
                Event Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="webinar">Webinar</option>
                <option value="workshop">Workshop</option>
                <option value="ama">AMA</option>
                <option value="conference">Conference</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-emerald-300 mb-2">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-emerald-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                rows={4}
                placeholder="Provide details about the event"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-emerald-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-emerald-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-emerald-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-emerald-300 mb-2">
                  <Users className="h-4 w-4 inline mr-2" />
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium text-emerald-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Virtual or physical location"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-emerald-300">
                  <Users className="h-4 w-4 inline mr-2" />
                  Speakers
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30"
                  onClick={handleAddSpeaker}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Speaker
                </Button>
              </div>

              <div className="space-y-4">
                {speakers.map((speaker, index) => (
                  <div key={index} className="p-4 bg-black/30 border border-emerald-500/30 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-emerald-300">Speaker {index + 1}</h4>
                      {speakers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 p-1 h-auto"
                          onClick={() => handleRemoveSpeaker(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => handleSpeakerChange(index, "name", e.target.value)}
                          className="w-full p-2 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Speaker name"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={speaker.bio}
                          onChange={(e) => handleSpeakerChange(index, "bio", e.target.value)}
                          className="w-full p-2 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Speaker bio/role"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-purple-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </DynamicGlowCard>
      </motion.div>
    </div>
  )
}

