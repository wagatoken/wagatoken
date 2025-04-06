import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, BadgeIcon as Certificate, Clock, Bell } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Blockchain for Coffee Traceability",
    description:
      "Learn how blockchain technology helps record production data for transparency and traceability in the coffee supply chain.",
    category: "Web3 & IT Infrastructure",
    level: "Beginner",
    href: "/courses/blockchain-coffee-traceability",
    instructor: {
      name: "Jane Doe",
      avatar: "JD",
    },
  },
  {
    id: 2,
    title: "DeFi Solutions for Coffee Farmers",
    description:
      "Understand how decentralized finance can provide yield-based lending and financial inclusion for smallholder farmers.",
    category: "Finance & Accounting",
    level: "Intermediate",
    href: "/courses/defi-coffee-farmers",
    instructor: {
      name: "Sarah Johnson",
      avatar: "SJ",
    },
  },
  {
    id: 3,
    title: "Sustainable Coffee Farming Practices",
    description:
      "Master agroecology, smart farming tools, and sustainable coffee production methods for improved yields and quality.",
    category: "Coffee Cultivation",
    level: "All Levels",
    href: "/courses/sustainable-coffee-farming",
    instructor: {
      name: "Abebe Kebede",
      avatar: "AK",
    },
  },
]

export default function DashboardPage() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter web3-gradient-text">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John! Track your learning progress</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
              <Link href="/courses">Browse Courses</Link>
            </Button>
            <Button asChild className="web3-button">
              <Link href="/dashboard/profile">My Profile</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Launch Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Q4 2025</div>
              <p className="text-xs text-muted-foreground">Curriculum development in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlist Status</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">You'll be notified when courses launch</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
              <Certificate className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Web3 & Coffee Cultivation</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Courses Coming Soon</CardTitle>
              <CardDescription>Our curriculum is currently in development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  The WAGA Academy is preparing to launch its comprehensive curriculum in Q4 2025. Join our waitlist to
                  be notified when courses become available.
                </p>
                <div className="flex justify-center">
                  <Button asChild className="web3-button">
                    <Link href="/courses">Browse Upcoming Courses</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Workshops and webinars</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Web3 for Coffee Traceability</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Tomorrow, 3:00 PM</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Webinar
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">DeFi Solutions Workshop</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>May 15, 2:00 PM</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Workshop
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Summer Camp Info Session</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>May 20, 4:00 PM</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Info Session
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/events">View All Events</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Upcoming Courses</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => {
              // Assign different card styles based on index
              const cardClasses = ["web3-card-featured web3-card-glow", "web3-card-blue", "web3-card-teal"]
              const cardClass = cardClasses[index % cardClasses.length]

              return (
                <Card key={index} className={`${cardClass} flex flex-col h-full`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="line-clamp-4">{course.description}</CardDescription>
                    <div className="mt-4 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Instructor" />
                        <AvatarFallback>{course.instructor.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">Instructor: {course.instructor.name}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={course.href}>Join Waitlist</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

