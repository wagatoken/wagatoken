"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { User, Settings, MessageSquare, Coffee, Globe, Shield, Twitter, Linkedin, Github } from "lucide-react"

// Sample user data
const userData = {
  name: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  avatar: "JD",
  bio: "Coffee enthusiast and blockchain developer interested in sustainable agriculture and Web3 applications for the coffee industry.",
  location: "New York, USA",
  joinDate: "May 2024",
  interests: ["Web3 & Blockchain", "Coffee Industry", "Sustainable Agriculture"],
  background: "Technology Professional",
  socialLinks: {
    twitter: "johndoe",
    linkedin: "johndoe",
    github: "johndoe",
  },
  activity: {
    topics: 5,
    replies: 12,
    likes: 24,
  },
  badges: [
    {
      name: "Early Adopter",
      icon: <Shield className="h-4 w-4" />,
      description: "Joined during the early access phase",
    },
    {
      name: "Coffee Expert",
      icon: <Coffee className="h-4 w-4" />,
      description: "Contributed valuable insights about coffee",
    },
    {
      name: "Web3 Enthusiast",
      icon: <Globe className="h-4 w-4" />,
      description: "Active in Web3 & blockchain discussions",
    },
  ],
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: userData.name,
    bio: userData.bio,
    location: userData.location,
    twitter: userData.socialLinks.twitter,
    linkedin: userData.socialLinks.linkedin,
    github: userData.socialLinks.github,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    }, 1000)
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter web3-dual-gradient-text-glow">My Profile</h1>
            <p className="text-muted-foreground">Manage your community profile and settings</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="border-purple-600/30 hover:border-purple-600/60">
              <Link href="/community/dashboard">Dashboard</Link>
            </Button>
            <Button className="web3-button-purple" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24 ring-2 ring-purple-500/30">
                    <AvatarImage src={`/placeholder.svg?height=96&width=96`} alt={userData.name} />
                    <AvatarFallback className="text-2xl">{userData.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{userData.name}</h2>
                    <p className="text-sm text-muted-foreground">@{userData.username}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {userData.badges.map((badge, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1 bg-purple-500/10 border-purple-500/30"
                      >
                        {badge.icon}
                        <span>{badge.name}</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="w-full pt-4 border-t border-purple-500/20">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold">{userData.activity.topics}</p>
                        <p className="text-xs text-muted-foreground">Topics</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{userData.activity.replies}</p>
                        <p className="text-xs text-muted-foreground">Replies</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{userData.activity.likes}</p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full pt-4 text-sm text-muted-foreground">
                    <p>Member since {userData.joinDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <MessageSquare className="mr-2 h-4 w-4" /> Activity
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="web3-gradient-text">Profile Information</CardTitle>
                    <CardDescription>
                      {isEditing ? "Edit your profile information below" : "View and manage your profile information"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="web3-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="bio" className="text-sm font-medium">
                            Bio
                          </label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={profileData.bio}
                            onChange={handleChange}
                            className="min-h-[100px] web3-input"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="location" className="text-sm font-medium">
                            Location
                          </label>
                          <Input
                            id="location"
                            name="location"
                            value={profileData.location}
                            onChange={handleChange}
                            className="web3-input"
                          />
                        </div>

                        <div className="pt-4 border-t border-purple-500/20">
                          <h3 className="text-lg font-medium web3-gradient-text mb-4">Social Links</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              <div className="space-y-2">
                                <label htmlFor="twitter" className="text-sm font-medium">
                                  Twitter
                                </label>
                                <Input
                                  id="twitter"
                                  name="twitter"
                                  value={profileData.twitter}
                                  onChange={handleChange}
                                  className="web3-input"
                                  placeholder="username"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="linkedin" className="text-sm font-medium">
                                  LinkedIn
                                </label>
                                <Input
                                  id="linkedin"
                                  name="linkedin"
                                  value={profileData.linkedin}
                                  onChange={handleChange}
                                  className="web3-input"
                                  placeholder="username"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="github" className="text-sm font-medium">
                                  GitHub
                                </label>
                                <Input
                                  id="github"
                                  name="github"
                                  value={profileData.github}
                                  onChange={handleChange}
                                  className="web3-input"
                                  placeholder="username"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                            <p className="mt-1">{userData.bio}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-muted-foreground">Location:</h3>
                            <p>{userData.location}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Interests</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {userData.interests.map((interest, index) => (
                                <Badge key={index} variant="outline">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Background</h3>
                            <p className="mt-1">{userData.background}</p>
                          </div>

                          <div className="pt-4 border-t border-purple-500/20">
                            <h3 className="text-lg font-medium mb-2">Social Links</h3>
                            <div className="flex flex-wrap gap-4">
                              {userData.socialLinks.twitter && (
                                <Link
                                  href={`https://twitter.com/${userData.socialLinks.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Twitter className="h-4 w-4" />@{userData.socialLinks.twitter}
                                </Link>
                              )}
                              {userData.socialLinks.linkedin && (
                                <Link
                                  href={`https://linkedin.com/in/${userData.socialLinks.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Linkedin className="h-4 w-4" />
                                  {userData.socialLinks.linkedin}
                                </Link>
                              )}
                              {userData.socialLinks.github && (
                                <Link
                                  href={`https://github.com/${userData.socialLinks.github}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Github className="h-4 w-4" />
                                  {userData.socialLinks.github}
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="flex justify-end">
                      <Button className="web3-button-purple" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="web3-gradient-text">Recent Activity</CardTitle>
                    <CardDescription>Your recent topics, replies, and other activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="topics">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="topics">Topics</TabsTrigger>
                        <TabsTrigger value="replies">Replies</TabsTrigger>
                        <TabsTrigger value="likes">Likes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="topics" className="mt-4 space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                            <div>
                              <Link href="/community/forums/topics/1" className="font-medium hover:text-primary">
                                How can blockchain improve coffee farmer incomes?
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Web3 & Blockchain
                                </Badge>
                                <span className="text-xs text-muted-foreground">3 days ago</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                            <div>
                              <Link href="/community/forums/topics/2" className="font-medium hover:text-primary">
                                Introducing myself: New to the community
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  General Discussion
                                </Badge>
                                <span className="text-xs text-muted-foreground">1 week ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="replies" className="mt-4 space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                            <div>
                              <p className="text-sm">
                                "I've been exploring the DeFi angle for agricultural financing. Traditional banks often
                                won't lend to smallholder farmers, but with blockchain, we can create lending pools
                                backed by future yield."
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Link
                                  href="/community/forums/topics/1"
                                  className="text-xs text-primary hover:underline"
                                >
                                  How can blockchain improve coffee farmer incomes?
                                </Link>
                                <span className="text-xs text-muted-foreground">2 days ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="likes" className="mt-4 space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 pb-4 border-b border-purple-500/20">
                            <div>
                              <p className="text-sm">
                                You liked a reply by <span className="font-medium">EthioExplorer</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                "Great question! I've been working with coffee cooperatives in Ethiopia on a blockchain
                                traceability pilot..."
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Link
                                  href="/community/forums/topics/1"
                                  className="text-xs text-primary hover:underline"
                                >
                                  How can blockchain improve coffee farmer incomes?
                                </Link>
                                <span className="text-xs text-muted-foreground">1 day ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="web3-gradient-text">Account Settings</CardTitle>
                    <CardDescription>Manage your account settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium web3-gradient-text">Email Preferences</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications about community activity
                            </p>
                          </div>
                          <Switch id="notifications" defaultChecked />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="digest">Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive a weekly summary of community activity
                            </p>
                          </div>
                          <Switch id="digest" defaultChecked />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="announcements">Announcements</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive important announcements about WAGA Academy
                            </p>
                          </div>
                          <Switch id="announcements" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-500/20 space-y-4">
                      <h3 className="text-lg font-medium web3-gradient-text">Privacy Settings</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="profile-visibility">Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                          </div>
                          <Select defaultValue="public">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="members">Members Only</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-500/20 space-y-4">
                      <h3 className="text-lg font-medium web3-gradient-text">Account Actions</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline">Change Password</Button>
                        <Button variant="outline" className="text-red-500 hover:text-red-600">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

