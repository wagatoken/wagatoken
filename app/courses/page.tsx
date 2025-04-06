"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const courses = [
  {
    id: 1,
    title: "Blockchain for Coffee Traceability",
    description:
      "Learn how blockchain technology helps record production data for transparency and traceability in the coffee supply chain.",
    category: "Web3 & IT Infrastructure",
    level: "Beginner",
    duration: "12 weeks",
    href: "/courses/blockchain-coffee-traceability",
  },
  {
    id: 2,
    title: "DeFi Solutions for Coffee Farmers",
    description:
      "Understand how decentralized finance can provide yield-based lending and financial inclusion for smallholder farmers.",
    category: "Finance & Accounting",
    level: "Intermediate",
    duration: "12 weeks",
    href: "/courses/defi-coffee-farmers",
  },
  {
    id: 3,
    title: "Sustainable Coffee Farming Practices",
    description:
      "Master agroecology, smart farming tools, and sustainable coffee production methods for improved yields and quality.",
    category: "Coffee Cultivation",
    level: "All Levels",
    duration: "12 weeks",
    href: "/courses/sustainable-coffee-farming",
  },
  {
    id: 4,
    title: "Coffee Tokenization Fundamentals",
    description:
      "Explore how coffee assets can be tokenized to enable fair pricing, financial resources, and global market access.",
    category: "Web3 & IT Infrastructure",
    level: "Intermediate",
    duration: "12 weeks",
    href: "/courses/coffee-tokenization",
  },
  {
    id: 5,
    title: "Supply Chain Management for Coffee",
    description:
      "Learn comprehensive knowledge in logistics, procurement, and distribution for seamless operations across the coffee value chain.",
    category: "Supply Chain Management",
    level: "Intermediate",
    duration: "12 weeks",
    href: "/courses/supply-chain-coffee",
  },
  {
    id: 6,
    title: "Web3 Digital Marketing for Coffee Brands",
    description:
      "Build expertise in branding, customer loyalty, and positioning of tokenized coffee for global markets.",
    category: "Marketing & Sales",
    level: "Beginner",
    duration: "12 weeks",
    href: "/courses/digital-marketing-coffee",
  },
  {
    id: 7,
    title: "Coffee Quality Control & Processing",
    description:
      "Develop skills in grading, processing methods, and quality control to ensure top-quality coffee beans.",
    category: "Coffee Processing",
    level: "Intermediate",
    duration: "12 weeks",
    href: "/courses/coffee-quality-control",
  },
  {
    id: 8,
    title: "IoT for Coffee Farm Monitoring",
    description:
      "Learn how to implement IoT solutions for real-time monitoring of coffee farms and processing facilities.",
    category: "Web3 & IT Infrastructure",
    level: "Advanced",
    duration: "12 weeks",
    href: "/courses/iot-coffee-monitoring",
  },
  {
    id: 9,
    title: "Ethical Coffee Sourcing & Sustainability",
    description:
      "Promote ethical sourcing and transparency throughout the coffee supply chain, ensuring sustainability and equity.",
    category: "Sustainability & Ethics",
    level: "All Levels",
    duration: "12 weeks",
    href: "/courses/ethical-coffee-sourcing",
  },
]

// Map dropdown values to actual category values in the data
const categoryMap = {
  all: "",
  web3: "Web3 & IT Infrastructure",
  finance: "Finance & Accounting",
  cultivation: "Coffee Cultivation",
  processing: "Coffee Processing",
  supply: "Supply Chain Management",
  marketing: "Marketing & Sales",
  sustainability: "Sustainability & Ethics",
}

// Map dropdown values to actual level values in the data
const levelMap = {
  all: "",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

export default function CoursesPage({ searchParams }: { searchParams: { category?: string } }) {
  // Default to 'all' if no category is specified
  const defaultTab = searchParams.category || "all"

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCourses, setFilteredCourses] = useState(courses)
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Filter courses based on all criteria
  useEffect(() => {
    let result = [...courses]

    // Apply category filter from dropdown
    if (selectedCategory !== "all") {
      const categoryValue = categoryMap[selectedCategory as keyof typeof categoryMap]
      if (categoryValue) {
        result = result.filter((course) => course.category === categoryValue)
      }
    }

    // Apply level filter
    if (selectedLevel !== "all") {
      const levelValue = levelMap[selectedLevel as keyof typeof levelMap]
      if (levelValue) {
        result = result.filter((course) => course.level === levelValue || course.level === "All Levels")
      }
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query),
      )
    }

    // Apply tab filter (this overrides the category dropdown)
    if (activeTab !== "all") {
      if (activeTab === "cultivation") {
        result = result.filter((course) => course.category === "Coffee Cultivation")
      } else if (activeTab === "processing") {
        result = result.filter((course) => course.category === "Coffee Processing")
      } else if (activeTab === "distribution") {
        result = result.filter((course) => course.category === "Supply Chain Management")
      } else if (activeTab === "web3") {
        result = result.filter((course) => course.category === "Web3 & IT Infrastructure")
      }
    }

    setFilteredCourses(result)
  }, [selectedCategory, selectedLevel, searchQuery, activeTab])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset category dropdown when changing tabs to avoid confusion
    if (value !== "all") {
      setSelectedCategory("all")
    }
  }

  // Render course card with appropriate styling
  const renderCourseCard = (course: (typeof courses)[0]) => {
    // Assign different card styles based on category
    let cardClass = "web3-card"
    if (course.category === "Web3 & IT Infrastructure") cardClass = "web3-card-purple"
    else if (course.category === "Finance & Accounting") cardClass = "web3-card-blue"
    else if (course.category === "Coffee Cultivation") cardClass = "web3-card-teal"
    else if (course.category === "Supply Chain Management") cardClass = "web3-card-amber"
    else if (course.category === "Marketing & Sales") cardClass = "web3-card-pink"
    else if (course.category === "Sustainability & Ethics") cardClass = "web3-card-emerald"
    else if (course.category === "Coffee Processing") cardClass = "web3-card-blue"

    return (
      <Card key={course.id} className={`${cardClass} flex flex-col h-full`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge variant="outline" className="mb-2">
              {course.category}
            </Badge>
            <Badge variant="secondary" className="mb-2 bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Coming Soon
            </Badge>
          </div>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="text-sm">Duration: {course.duration}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="line-clamp-4">{course.description}</CardDescription>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full web3-button-purple">
            <Link href={course.href}>Join Waitlist</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container py-12 md:py-24">
      <div className="space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl web3-dual-gradient-text-glow">
            Courses
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Browse our upcoming curriculum designed around the coffee value chain
          </p>
          <div className="inline-block rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-sm text-purple-300">
            Pre-registration open • Launching Q4 2025
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="web3-input"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] web3-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur border border-purple-500/30 shadow-lg">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web3">Web3 & IT</SelectItem>
                <SelectItem value="finance">Finance & Accounting</SelectItem>
                <SelectItem value="cultivation">Coffee Cultivation</SelectItem>
                <SelectItem value="processing">Coffee Processing</SelectItem>
                <SelectItem value="supply">Supply Chain</SelectItem>
                <SelectItem value="marketing">Marketing & Sales</SelectItem>
                <SelectItem value="sustainability">Sustainability</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px] web3-input">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur border border-purple-500/30 shadow-lg">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="cultivation">Cultivation</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="web3">Web3</TabsTrigger>
          </TabsList>

          {/* All tabs now use the filtered courses */}
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => renderCourseCard(course))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No courses match your filters. Try adjusting your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 web3-button-outline"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedLevel("all")
                      setSearchQuery("")
                      setActiveTab("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* These tabs now just change the active tab state, which triggers filtering */}
          <TabsContent value="cultivation" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => renderCourseCard(course))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No courses match your filters. Try adjusting your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 web3-button-outline"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedLevel("all")
                      setSearchQuery("")
                      setActiveTab("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => renderCourseCard(course))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No courses match your filters. Try adjusting your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 web3-button-outline"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedLevel("all")
                      setSearchQuery("")
                      setActiveTab("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => renderCourseCard(course))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No courses match your filters. Try adjusting your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 web3-button-outline"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedLevel("all")
                      setSearchQuery("")
                      setActiveTab("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="web3" className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => renderCourseCard(course))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No courses match your filters. Try adjusting your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 web3-button-outline"
                    onClick={() => {
                      setSelectedCategory("all")
                      setSelectedLevel("all")
                      setSearchQuery("")
                      setActiveTab("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

