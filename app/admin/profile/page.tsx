"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Activity,
  Award,
  Calendar,
  Edit,
  FileText,
  Key,
  Mail,
  MapPin,
  Phone,
  Settings,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function AdminProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="rounded-lg overflow-hidden border border-purple-500/20">
        <div className="h-32 bg-gradient-to-r from-purple-500/20 to-blue-500/20 relative">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/10"
          >
            <Edit className="h-4 w-4 mr-2 text-purple-400" />
            Edit Cover
          </Button>
        </div>
        <div className="bg-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-end relative">
          <div className="absolute -top-16 left-6 rounded-full border-4 border-card overflow-hidden">
            <Image
              src="/placeholder.svg?height=128&width=128"
              alt="Admin Avatar"
              width={128}
              height={128}
              className="bg-muted"
            />
          </div>
          <div className="mt-16 md:mt-0 md:ml-36 flex-1">
            <h1 className="text-2xl font-bold web3-gradient-text">Alex Johnson</h1>
            <p className="text-muted-foreground">Senior Administrator</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-blue-400" />
              <span>Team Lead</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Joined Mar 2023</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-teal-400" />
              <span>Full Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border border-purple-500/20 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-foreground"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-foreground"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-foreground"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Information */}
            <Card className="border-purple-500/20 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Profile Information
                </CardTitle>
                <CardDescription>Personal and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">Alex Johnson</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">alex.johnson</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      Email Address
                    </p>
                    <p className="font-medium">alex.johnson@wagaacademy.com</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-teal-400" />
                      Phone Number
                    </p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pink-400" />
                      Location
                    </p>
                    <p className="font-medium">San Francisco, CA</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      Role
                    </p>
                    <p className="font-medium">Senior Administrator</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">
                    Senior administrator at WAGA Academy with over 5 years of experience in educational technology and
                    blockchain. Passionate about creating innovative learning experiences and managing educational
                    resources.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Stats */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Admin Stats
                </CardTitle>
                <CardDescription>Your administration metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resources Created</span>
                    <span className="font-medium">42</span>
                  </div>
                  <Progress
                    value={70}
                    className="h-2 bg-purple-500/10"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Courses Managed</span>
                    <span className="font-medium">15</span>
                  </div>
                  <Progress
                    value={50}
                    className="h-2 bg-purple-500/10"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Events Organized</span>
                    <span className="font-medium">8</span>
                  </div>
                  <Progress
                    value={30}
                    className="h-2 bg-purple-500/10"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Forum Moderation</span>
                    <span className="font-medium">127</span>
                  </div>
                  <Progress
                    value={85}
                    className="h-2 bg-purple-500/10"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/resources/new" className="w-full">
                  <Button
                    variant="outline"
                    className="h-auto py-4 w-full border-purple-600/30 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span>Add Resource</span>
                  </Button>
                </Link>
                <Link href="/admin/courses/new" className="w-full">
                  <Button
                    variant="outline"
                    className="h-auto py-4 w-full border-purple-600/30 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2"
                  >
                    <BookOpen className="h-5 w-5 text-teal-400" />
                    <span>Create Course</span>
                  </Button>
                </Link>
                <Link href="/admin/events/new" className="w-full">
                  <Button
                    variant="outline"
                    className="h-auto py-4 w-full border-purple-600/30 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2"
                  >
                    <Calendar className="h-5 w-5 text-pink-400" />
                    <span>Schedule Event</span>
                  </Button>
                </Link>
                <Link href="/admin/settings" className="w-full">
                  <Button
                    variant="outline"
                    className="h-auto py-4 w-full border-purple-600/30 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2"
                  >
                    <Settings className="h-5 w-5 text-purple-400" />
                    <span>Site Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-400" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Activity Timeline */}
                <div className="relative pl-6 border-l border-purple-500/30 space-y-6">
                  {/* Activity Item 1 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Added new resource</h4>
                        <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Resource</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Added "Introduction to Web3 Development" to the resources library
                      </p>
                      <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-teal-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Updated course content</h4>
                        <span className="text-xs bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded-full">Course</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Updated module 3 of "Blockchain Fundamentals" course
                      </p>
                      <p className="text-xs text-muted-foreground">Yesterday at 4:15 PM</p>
                    </div>
                  </div>

                  {/* Activity Item 3 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center">
                      <Calendar className="h-3 w-3 text-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Created new event</h4>
                        <span className="text-xs bg-pink-500/10 text-pink-500 px-2 py-0.5 rounded-full">Event</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created "Web3 Developer Workshop" event scheduled for next month
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago at 11:20 AM</p>
                    </div>
                  </div>

                  {/* Activity Item 4 */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0 h-5 w-5 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center">
                      <MessageSquare className="h-3 w-3 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Moderated forum discussion</h4>
                        <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">Forum</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resolved dispute in "Smart Contract Security" discussion thread
                      </p>
                      <p className="text-xs text-muted-foreground">3 days ago at 2:45 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Skills & Expertise
              </CardTitle>
              <CardDescription>Your administrative capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Skills */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-400" />
                    Technical Skills
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Content Management</span>
                        <span>Expert</span>
                      </div>
                      <Progress
                        value={95}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Web3 Knowledge</span>
                        <span>Advanced</span>
                      </div>
                      <Progress
                        value={85}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Data Analysis</span>
                        <span>Intermediate</span>
                      </div>
                      <Progress
                        value={70}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>System Administration</span>
                        <span>Advanced</span>
                      </div>
                      <Progress
                        value={80}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Administrative Skills */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-teal-400" />
                    Administrative Skills
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>User Management</span>
                        <span>Expert</span>
                      </div>
                      <Progress
                        value={90}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-teal-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Course Organization</span>
                        <span>Expert</span>
                      </div>
                      <Progress
                        value={95}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-teal-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Event Planning</span>
                        <span>Advanced</span>
                      </div>
                      <Progress
                        value={85}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-teal-500 to-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Community Moderation</span>
                        <span>Expert</span>
                      </div>
                      <Progress
                        value={90}
                        className="h-2 bg-purple-500/10"
                        indicatorClassName="bg-gradient-to-r from-teal-500 to-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-pink-400" />
                  Certifications & Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-md bg-purple-500/5 border border-purple-500/20">
                    <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Certified Web3 Administrator</h4>
                      <p className="text-xs text-muted-foreground">Blockchain Education Alliance</p>
                      <p className="text-xs text-muted-foreground mt-1">Issued Jan 2023</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-md bg-blue-500/5 border border-blue-500/20">
                    <Award className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Educational Content Management</h4>
                      <p className="text-xs text-muted-foreground">EdTech Association</p>
                      <p className="text-xs text-muted-foreground mt-1">Issued Mar 2022</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your profile preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        defaultValue="Alex Johnson"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        defaultValue="alex.johnson"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        defaultValue="alex.johnson@wagaacademy.com"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="w-full p-2 rounded-md border border-purple-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-medium">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">Email Notifications</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-purple-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-teal-400" />
                        <span className="text-sm">System Alerts</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-purple-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-pink-400" />
                        <span className="text-sm">Forum Notifications</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-purple-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button variant="outline" className="border-purple-600/30 hover:border-purple-600/60">
                    Cancel
                  </Button>
                  <Button className="bg-purple-500 hover:bg-purple-600">Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Bell } from "lucide-react"
import { BookOpen } from "lucide-react"
import { MessageSquare } from "lucide-react"

