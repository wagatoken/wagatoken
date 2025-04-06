"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewForumTopic() {
  const [isSaving, setIsSaving] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false)
      // In a real app, you would redirect to the forums list or show a success message
      alert("Forum topic created successfully!")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold web3-gradient-text">Create New Forum Topic</h1>
        <p className="text-muted-foreground mt-2">Start a new discussion in the community forums</p>
      </div>

      <Card className="border border-purple-500/30 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
            <CardDescription>Provide information about the topic you're creating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Topic Title</Label>
              <Input
                id="title"
                placeholder="Enter topic title"
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
                  <SelectItem value="farming">Farming</SelectItem>
                  <SelectItem value="web3">Web3</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Topic Content</Label>
              <Textarea
                id="content"
                placeholder="Write your topic content here..."
                rows={8}
                required
                className="border-purple-500/30 focus:ring-purple-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="coffee, blockchain, farming, etc." />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="is-pinned"
                checked={isPinned}
                onCheckedChange={(checked) => setIsPinned(checked as boolean)}
                className="border-purple-500/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              />
              <Label htmlFor="is-pinned" className="cursor-pointer">
                Pin this topic to the top of the forum
              </Label>
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
            <Button className="web3-button-purple" type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Create Topic
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

