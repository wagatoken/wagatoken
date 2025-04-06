"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, Plus, Search, Trash2, Users, Clock, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    title: "Introduction to Blockchain for Coffee",
    instructor: "Dr. Sarah Johnson",
    level: "Beginner",
    duration: "4 weeks",
    students: 156,
    status: "Published",
    image: "/placeholder.svg?height=100&width=180",
  },
  {
    id: 2,
    title: "Advanced Supply Chain Transparency",
    instructor: "Prof. Michael Chen",
    level: "Advanced",
    duration: "6 weeks",
    students: 89,
    status: "Published",
    image: "/placeholder.svg?height=100&width=180",
  },
  {
    id: 3,
    title: "Coffee Farming Best Practices",
    instructor: "Maria Rodriguez",
    level: "Intermediate",
    duration: "5 weeks",
    students: 124,
    status: "Published",
    image: "/placeholder.svg?height=100&width=180",
  },
  {
    id: 4,
    title: "Web3 Integration for Agricultural Products",
    instructor: "Dr. James Wilson",
    level: "Advanced",
    duration: "8 weeks",
    students: 67,
    status: "Draft",
    image: "/placeholder.svg?height=100&width=180",
  },
  {
    id: 5,
    title: "Sustainable Coffee Production",
    instructor: "Emma Thompson",
    level: "Beginner",
    duration: "3 weeks",
    students: 0,
    status: "Scheduled",
    image: "/placeholder.svg?height=100&width=180",
  },
]

export default function CoursesAdmin() {
  const [courses, setCourses] = useState(mockCourses)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [levelFilter, setLevelFilter] = useState("")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "" || statusFilter === "all" || course.status === statusFilter
    const matchesLevel = levelFilter === "" || levelFilter === "all" || course.level === levelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

  const handleDelete = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-green-500"
      case "Intermediate":
        return "text-blue-500"
      case "Advanced":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold web3-gradient-text">Courses Management</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
            Create, edit, and manage educational courses
          </p>
        </div>
        <Button className="web3-button-purple w-full sm:w-auto" asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      <Card className="border border-purple-500/30 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent">
          <CardTitle>Filter Courses</CardTitle>
          <CardDescription>Search and filter the course catalog</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Search courses..."
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
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden border border-purple-600/30 hover:border-purple-600/60 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/10 p-3 md:p-4 flex items-center justify-center">
                <Image
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  width={180}
                  height={100}
                  className="rounded-md object-cover shadow-sm w-full md:w-auto h-32 md:h-auto"
                />
              </div>
              <div className="flex-1 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base md:text-lg">{course.title}</h3>
                      <span
                        className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${
                          course.status === "Published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : course.status === "Draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <BookOpen className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-purple-500" /> Instructor:{" "}
                        {course.instructor}
                      </span>
                      <span className={`text-xs md:text-sm flex items-center ${getLevelColor(course.level)}`}>
                        <span className="text-muted-foreground mr-1">Level:</span> {course.level}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 space-x-2 md:space-x-4 flex-wrap">
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-blue-500" /> {course.duration}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 text-green-500" /> {course.students} students
                        enrolled
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 self-end md:self-start mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                    >
                      <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                      <span className="hidden md:inline">Preview</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 hover:bg-purple-500/10 h-8 px-2 md:px-3"
                    >
                      <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2 text-purple-500" />
                      <span className="hidden md:inline">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
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

