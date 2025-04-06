"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function NewTopicPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.title.trim() || !formData.category || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Topic created",
        description: "Your topic has been posted successfully",
      })
      router.push("/community/forums")
    }, 1000)
  }

  return (
    <div className="container py-12">
      <div className="space-y-6">
        <div>
          <Link href="/community/forums" className="text-primary hover:underline mb-2 inline-flex items-center">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Forums
          </Link>
          <h1 className="text-3xl font-bold tracking-tighter mt-2 web3-gradient-text">Create New Topic</h1>
          <p className="text-muted-foreground">Start a new discussion in the community</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Topic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Topic Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter a descriptive title for your topic"
                  className="web3-input"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select onValueChange={handleCategoryChange} value={formData.category}>
                  <SelectTrigger className="web3-input">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Discussion</SelectItem>
                    <SelectItem value="web3">Web3 & Blockchain</SelectItem>
                    <SelectItem value="coffee">Coffee Industry</SelectItem>
                    <SelectItem value="education">Education & Training</SelectItem>
                    <SelectItem value="summer-camp">Summer Camp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your topic content here..."
                  className="min-h-[200px] web3-input"
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  You can use basic formatting like **bold**, *italic*, and [links](url).
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/community/forums")}>
                Cancel
              </Button>
              <Button type="submit" className="web3-button-purple" disabled={isSubmitting}>
                {isSubmitting ? "Creating Topic..." : "Create Topic"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

