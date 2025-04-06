"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Plus, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewCourse() {
  const [isSaving, setIsSaving] = useState(false)
  const [coverImage, setCoverImage] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, you would upload the file to a server and get a URL back
      // For this demo, we'll just use a placeholder
      setCoverImage("/placeholder.svg?height=200&width=400")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false)
      // In a real app, you would redirect to the courses list or show a success message
      alert("Course created successfully!")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold web3-gradient-text">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Design and publish a new educational course</p>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4 border border-purple-500/30 bg-background p-1">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-foreground"
          >
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-foreground"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="requirements"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-foreground"
          >
            Requirements
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-foreground"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="basic">
            <Card className="border border-purple-500/30 shadow-md">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Provide the basic details about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title"
                    required
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of this course"
                    rows={4}
                    required
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      placeholder="Instructor name"
                      required
                      className="border-purple-500/30 focus:ring-purple-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select required>
                      <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blockchain">Blockchain</SelectItem>
                        <SelectItem value="farming">Coffee Farming</SelectItem>
                        <SelectItem value="supply-chain">Supply Chain</SelectItem>
                        <SelectItem value="web3">Web3</SelectItem>
                        <SelectItem value="sustainability">Sustainability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select required>
                      <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 4 weeks"
                      required
                      className="border-purple-500/30 focus:ring-purple-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="portuguese">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-purple-500/5 transition-colors">
                    {coverImage ? (
                      <div className="space-y-4 flex flex-col items-center">
                        <img
                          src={coverImage || "/placeholder.svg"}
                          alt="Course cover"
                          className="rounded-md max-h-40 object-cover"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => setCoverImage("")}>
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Drag and drop an image here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground">Recommended size: 1280x720px (16:9 ratio)</p>
                          <div>
                            <label className="cursor-pointer">
                              <Input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                              <Button type="button" variant="outline" size="sm">
                                Browse Images
                              </Button>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="blockchain, coffee, farming, etc."
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => window.history.back()}
                  className="border-purple-600/30 hover:border-purple-600/60"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="web3-button-purple"
                  onClick={() => document.querySelector('[data-value="content"]')?.click()}
                >
                  Next: Course Content
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="border border-purple-500/30 shadow-md">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Organize your course into modules and lessons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Modules</h3>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Module
                    </Button>
                  </div>

                  <Card className="border border-purple-500/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Module 1: Introduction</CardTitle>
                        <div className="flex space-x-2">
                          <Button type="button" variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Lessons</h4>
                          <Button type="button" variant="ghost" size="sm">
                            <Plus className="h-3 w-3 mr-1" /> Add Lesson
                          </Button>
                        </div>
                        <div className="pl-4 space-y-2">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm">1.1 Course Overview</span>
                            <div className="flex space-x-2">
                              <Button type="button" variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button type="button" variant="ghost" size="sm">
                                Delete
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm">1.2 Introduction to Blockchain</span>
                            <div className="flex space-x-2">
                              <Button type="button" variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button type="button" variant="ghost" size="sm">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-purple-500/30 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Module 2: Coffee Supply Chain Basics</CardTitle>
                        <div className="flex space-x-2">
                          <Button type="button" variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Lessons</h4>
                          <Button type="button" variant="ghost" size="sm">
                            <Plus className="h-3 w-3 mr-1" /> Add Lesson
                          </Button>
                        </div>
                        <div className="pl-4 space-y-2">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm">2.1 Coffee Production Process</span>
                            <div className="flex space-x-2">
                              <Button type="button" variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button type="button" variant="ghost" size="sm">
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="basic"]')?.click()}
                  className="border-purple-600/30 hover:border-purple-600/60"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="web3-button-purple"
                  onClick={() => document.querySelector('[data-value="requirements"]')?.click()}
                >
                  Next: Requirements
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="requirements">
            <Card className="border border-purple-500/30 shadow-md">
              <CardHeader>
                <CardTitle>Course Requirements</CardTitle>
                <CardDescription>Specify what students need to know before taking this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    placeholder="What should students know before taking this course?"
                    rows={4}
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Textarea
                    id="target-audience"
                    placeholder="Who is this course designed for?"
                    rows={4}
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learning-objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning-objectives"
                    placeholder="What will students learn by the end of this course?"
                    rows={4}
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="content"]')?.click()}
                  className="border-purple-600/30 hover:border-purple-600/60"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="web3-button-purple"
                  onClick={() => document.querySelector('[data-value="settings"]')?.click()}
                >
                  Next: Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border border-purple-500/30 shadow-md">
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>Configure additional settings for your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Publication Status</Label>
                    <Select defaultValue="draft">
                      <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select defaultValue="public">
                      <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private (Invitation Only)</SelectItem>
                        <SelectItem value="unlisted">Unlisted (Hidden from Browse)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate">Certificate</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger className="border-purple-500/30 focus:ring-purple-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Issue Certificate on Completion</SelectItem>
                      <SelectItem value="no">No Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-resources">Additional Resources</Label>
                  <Textarea
                    id="additional-resources"
                    placeholder="Any additional resources or materials for this course"
                    rows={4}
                    className="border-purple-500/30 focus:ring-purple-500/30"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="requirements"]')?.click()}
                  className="border-purple-600/30 hover:border-purple-600/60"
                >
                  Back
                </Button>
                <Button className="web3-button-purple" type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Create Course
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}

