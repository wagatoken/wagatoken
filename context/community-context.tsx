"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

// Define types for all entities
type User = {
  id: string
  name: string
  avatar: string
  role: "member" | "moderator" | "admin"
  joinDate: string
  reputation: number
  badges: string[]
}

type Activity = {
  id: string
  type: "post" | "comment" | "resource" | "event" | "reaction"
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar: string
  }
  timestamp: string
  url: string
}

type Event = {
  id: string
  title: string
  description: string
  type: "webinar" | "workshop" | "ama" | "conference"
  date: string
  time: string
  duration: number
  speakers: {
    id: string
    name: string
    avatar: string
    bio: string
  }[]
  registeredCount: number
  capacity: number
  isRegistered: boolean
}

type Resource = {
  id: string
  title: string
  description: string
  type: "guide" | "tutorial" | "whitepaper" | "video"
  author: {
    id: string
    name: string
    avatar: string
  }
  publishDate: string
  downloadCount: number
  rating: number
  url: string
}

type ForumTopic = {
  id: string
  title: string
  category: string
  author: {
    id: string
    name: string
    avatar: string
  }
  publishDate: string
  replyCount: number
  viewCount: number
  lastActivity: string
  isSticky: boolean
  isLocked: boolean
  url: string
}

type CommunityContextType = {
  user: User | null
  activities: Activity[]
  events: Event[]
  resources: Resource[]
  forumTopics: ForumTopic[]
  isLoading: boolean
  error: string | null
  fetchUserActivity: () => Promise<void>
  registerForEvent: (eventId: string) => Promise<void>
  createForumTopic: (topic: Partial<ForumTopic>) => Promise<void>
  downloadResource: (resourceId: string) => Promise<void>
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

// Mock API functions - would be replaced with real API calls
const fetchCommunityData = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Get current date for realistic timestamps
  const currentDate = new Date()

  // Helper to create dates relative to today
  const daysAgo = (days: number) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - days)
    return date.toISOString()
  }

  // Helper to create future dates
  const daysFromNow = (days: number) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Mock user data
  const user: User = {
    id: "user-1",
    name: "Maria Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    joinDate: daysAgo(2),
    reputation: 2,
    badges: ["Early Adopter"],
  }

  // Mock activities
  const activities: Activity[] = [
    {
      id: "activity-1",
      type: "post",
      title: "Welcome to WAGA Protocol Community",
      content: "We're excited to launch our community platform. Feel free to introduce yourself!",
      author: {
        id: "user-admin",
        name: "WAGA Admin",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: daysAgo(1),
      url: "/community/forum/post/1",
    },
    {
      id: "activity-2",
      type: "resource",
      title: "Getting Started with WAGA Protocol",
      content: "A beginner's guide to understanding the WAGA Protocol ecosystem",
      author: {
        id: "user-admin",
        name: "WAGA Admin",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: daysAgo(1),
      url: "/community/resources/getting-started",
    },
  ]

  // Mock events
  const events: Event[] = [
    {
      id: "event-1",
      title: "WAGA Protocol Introduction Webinar",
      description:
        "Join us for an introduction to the WAGA Protocol and learn how it's transforming the coffee industry",
      type: "webinar",
      date: daysFromNow(7),
      time: "14:00",
      duration: 60,
      speakers: [
        {
          id: "speaker-1",
          name: "Daniel Kimathi",
          avatar: "/placeholder.svg?height=60&width=60",
          bio: "Lead Developer at WAGA Protocol",
        },
      ],
      registeredCount: 3,
      capacity: 100,
      isRegistered: false,
    },
  ]

  // Mock resources
  const resources: Resource[] = [
    {
      id: "resource-1",
      title: "WAGA Protocol Introduction",
      description: "An overview of the WAGA Protocol and its mission",
      type: "guide",
      author: {
        id: "user-admin",
        name: "WAGA Protocol Team",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: daysAgo(1),
      downloadCount: 2,
      rating: 5.0,
      url: "/resources/waga-introduction.pdf",
    },
  ]

  // Mock forum topics
  const forumTopics: ForumTopic[] = [
    {
      id: "topic-1",
      title: "Welcome to the WAGA Protocol Community",
      category: "Announcements",
      author: {
        id: "user-admin",
        name: "WAGA Admin",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      publishDate: daysAgo(1),
      replyCount: 1,
      viewCount: 3,
      lastActivity: daysAgo(0.5),
      isSticky: true,
      isLocked: false,
      url: "/community/forum/topic/1",
    },
  ]

  return {
    user,
    activities,
    events,
    resources,
    forumTopics,
  }
}

const registerEventAPI = async (eventId: string, userId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  // In a real implementation, this would register the user for the event via your API
  return { success: true }
}

const createForumTopicAPI = async (topicData: Partial<ForumTopic>) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real implementation, this would create a new forum topic via your API
  return {
    id: `topic-${Date.now()}`,
    ...topicData,
    publishDate: new Date().toISOString(),
    replyCount: 0,
    viewCount: 0,
    lastActivity: new Date().toISOString(),
    isSticky: false,
    isLocked: false,
    url: `/community/forum/topic/${Date.now()}`,
  }
}

const downloadResourceAPI = async (resourceId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // In a real implementation, this would track the download and return the resource URL
  return { success: true, downloadUrl: `/api/resources/${resourceId}/download` }
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch user data on mount
  useEffect(() => {
    fetchUserActivity()
  }, [])

  const fetchUserActivity = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await fetchCommunityData()

      setUser(data.user)
      setActivities(data.activities)
      setEvents(data.events)
      setResources(data.resources)
      setForumTopics(data.forumTopics)
    } catch (err) {
      console.error("Failed to fetch community data:", err)
      setError("Failed to fetch community data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const registerForEvent = useCallback(
    async (eventId: string) => {
      if (!user) {
        setError("You must be logged in to register for events")
        return
      }

      try {
        const result = await registerEventAPI(eventId, user.id)

        if (result.success) {
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    isRegistered: true,
                    registeredCount: event.registeredCount + 1,
                  }
                : event,
            ),
          )
        }
      } catch (err) {
        console.error("Failed to register for event:", err)
        setError("Failed to register for event. Please try again.")
      }
    },
    [user],
  )

  const createForumTopic = useCallback(
    async (topic: Partial<ForumTopic>) => {
      if (!user) {
        setError("You must be logged in to create forum topics")
        return
      }

      try {
        const authorInfo = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        }

        const newTopic = await createForumTopicAPI({
          ...topic,
          author: authorInfo,
        })

        setForumTopics((prev) => [newTopic as ForumTopic, ...prev])
      } catch (err) {
        console.error("Failed to create forum topic:", err)
        setError("Failed to create forum topic. Please try again.")
      }
    },
    [user],
  )

  const downloadResource = useCallback(async (resourceId: string) => {
    try {
      const result = await downloadResourceAPI(resourceId)

      if (result.success) {
        // Update local state to reflect the download
        setResources((prevResources) =>
          prevResources.map((resource) =>
            resource.id === resourceId
              ? {
                  ...resource,
                  downloadCount: resource.downloadCount + 1,
                }
              : resource,
          ),
        )

        // In a real implementation, you might redirect to the download URL
        // window.open(result.downloadUrl, '_blank')
      }
    } catch (err) {
      console.error("Failed to download resource:", err)
      setError("Failed to download resource. Please try again.")
    }
  }, [])

  return (
    <CommunityContext.Provider
      value={{
        user,
        activities,
        events,
        resources,
        forumTopics,
        isLoading,
        error,
        fetchUserActivity,
        registerForEvent,
        createForumTopic,
        downloadResource,
      }}
    >
      {children}
    </CommunityContext.Provider>
  )
}

export function useCommunity() {
  const context = useContext(CommunityContext)
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider")
  }
  return context
}

