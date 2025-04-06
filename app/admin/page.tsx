import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, FileText, MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter web3-dual-gradient-text-glow">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your content and monitor platform activity</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            asChild
            variant="outline"
            className="border-purple-600/30 hover:border-purple-600/60 text-xs md:text-sm px-2 md:px-4"
          >
            <Link href="/admin/profile">Admin Profile</Link>
          </Button>
          <Button asChild className="web3-button-purple text-xs md:text-sm px-2 md:px-4">
            <Link href="/admin/settings">Settings</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="web3-card-purple">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">0</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Ready to add your first course</p>
          </CardContent>
        </Card>
        <Card className="web3-card-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Resources</CardTitle>
            <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">0</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Ready for your first resource</p>
          </CardContent>
        </Card>
        <Card className="web3-card-teal col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Active Users</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">0</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Waiting for first users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 web3-card-featured">
          <CardHeader>
            <CardTitle className="web3-gradient-text">Getting Started</CardTitle>
            <CardDescription>Steps to set up your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-purple-500/20">
                <div className="sm:w-1/4">
                  <div className="bg-purple-500/10 p-2 md:p-4 rounded-md text-center">
                    <p className="text-xs md:text-sm font-medium">Step 1</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Course Setup</p>
                  </div>
                </div>
                <div className="sm:w-3/4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm md:font-medium">Create Your First Course</h3>
                    <div className="bg-purple-500/10 border-purple-500/30 text-purple-300 px-1 py-0.5 md:px-2 md:py-1 rounded-md text-[10px] md:text-xs">
                      Pending
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Add your first blockchain course to the platform
                  </p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-purple-600/30 hover:border-purple-600/60 text-xs h-7 md:h-8"
                  >
                    <Link href="/admin/courses/new">Create Course</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-purple-500/20">
                <div className="sm:w-1/4">
                  <div className="bg-blue-500/10 p-4 rounded-md text-center">
                    <p className="text-sm font-medium">Step 2</p>
                    <p className="text-xs text-muted-foreground">Resource Setup</p>
                  </div>
                </div>
                <div className="sm:w-3/4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Add Learning Resources</h3>
                    <div className="bg-blue-500/10 border-blue-500/30 text-blue-300 px-2 py-1 rounded-md text-xs">
                      Pending
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Upload guides and materials for your students</p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-purple-600/30 hover:border-purple-600/60"
                  >
                    <Link href="/admin/resources/new">Add Resources</Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-purple-500/20">
                <div className="sm:w-1/4">
                  <div className="bg-teal-500/10 p-4 rounded-md text-center">
                    <p className="text-sm font-medium">Step 3</p>
                    <p className="text-xs text-muted-foreground">Community Setup</p>
                  </div>
                </div>
                <div className="sm:w-3/4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">Create Welcome Forum Topic</h3>
                    <div className="bg-teal-500/10 border-teal-500/30 text-teal-300 px-2 py-1 rounded-md text-xs">
                      Pending
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Start the conversation in your community</p>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-purple-600/30 hover:border-purple-600/60"
                  >
                    <Link href="/admin/forums/new">Create Topic</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="web3-card-purple">
          <CardHeader>
            <CardTitle className="web3-gradient-text">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2 md:gap-4 pb-4 border-b border-purple-500/20">
                <div className="bg-purple-500/10 p-1 md:p-2 rounded-md">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs md:text-sm font-medium">Add New Resource</p>
                  <div className="pt-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-purple-600/30 hover:border-purple-600/60 text-xs h-7 md:h-8 w-full md:w-auto"
                    >
                      <Link href="/admin/resources/new">Create Resource</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                <div className="bg-blue-500/10 p-2 rounded-md">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Add New Course</p>
                  <div className="pt-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-purple-600/30 hover:border-purple-600/60"
                    >
                      <Link href="/admin/courses/new">Create Course</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                <div className="bg-teal-500/10 p-2 rounded-md">
                  <Calendar className="h-8 w-8 text-teal-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Create New Event</p>
                  <div className="pt-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-purple-600/30 hover:border-purple-600/60"
                    >
                      <Link href="/admin/events/new">Create Event</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-500/10 p-2 rounded-md">
                  <MessageSquare className="h-8 w-8 text-pink-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New Forum Topic</p>
                  <div className="pt-1">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-purple-600/30 hover:border-purple-600/60"
                    >
                      <Link href="/admin/forums/new">Create Topic</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6 web3-gradient-text">Platform Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="web3-card-purple hover:border-purple-500/40 transition-colors">
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs md:text-sm font-medium">Launch Status</p>
                  <p className="text-xl md:text-2xl font-bold">Ready</p>
                </div>
                <div className="bg-purple-500/20 p-2 md:p-3 rounded-full">
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                </div>
              </div>
              <div className="mt-2 md:mt-4">
                <p className="text-[10px] md:text-xs text-muted-foreground">Platform is live and ready for content</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

