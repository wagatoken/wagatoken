"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/community/dashboard-header"
import DynamicGlowCard from "@/components/dynamic-glow-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, FileText, BookOpen, Video, FileCode } from "lucide-react"
import Link from "next/link"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function UploadResourcePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("guide")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !file) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Redirect to resources page after submission
      router.push("/community/resources")
    }, 1000)
  }

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case "guide":
        return <BookOpen className="h-6 w-6 text-emerald-400" />
      case "tutorial":
        return <FileCode className="h-6 w-6 text-purple-400" />
      case "whitepaper":
        return <FileText className="h-6 w-6 text-emerald-400" />
      case "video":
        return <Video className="h-6 w-6 text-purple-400" />
      default:
        return <FileText className="h-6 w-6 text-emerald-400" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader title="Upload Resource" description="Share your knowledge and resources with the community" />

      <div className="mb-6">
        <Link href="/community/resources">
          <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 p-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </Link>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <DynamicGlowCard variant="emerald" className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="type" className="block text-sm font-medium text-emerald-300 mb-2">
                Resource Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["guide", "tutorial", "whitepaper", "video"].map((resourceType) => (
                  <div
                    key={resourceType}
                    className={`cursor-pointer p-4 rounded-lg border ${
                      type === resourceType
                        ? "border-emerald-500 bg-emerald-900/20"
                        : "border-emerald-500/30 bg-black/30"
                    }`}
                    onClick={() => setType(resourceType)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">{getResourceIcon(resourceType)}</div>
                      <span className="text-sm capitalize">{resourceType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-emerald-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-emerald-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-black/30 border border-emerald-500/30 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                rows={4}
                placeholder="Provide a brief description of your resource"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="file" className="block text-sm font-medium text-emerald-300 mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-emerald-500/30 rounded-lg p-6 text-center">
                <input type="file" id="file" onChange={handleFileChange} className="hidden" required />
                <label htmlFor="file" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-emerald-400 mb-2" />
                  <p className="text-emerald-300 mb-1">Drag and drop your file here or click to browse</p>
                  <p className="text-sm text-gray-400">
                    {type === "video" ? "MP4, WebM (max 100MB)" : "PDF, DOCX, PPTX (max 20MB)"}
                  </p>
                  {file && (
                    <div className="mt-4 p-2 bg-emerald-900/20 rounded-md">
                      <p className="text-emerald-300">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-purple-600"
                disabled={isSubmitting || !file}
              >
                {isSubmitting ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                  </>
                )}
              </Button>
            </div>
          </form>
        </DynamicGlowCard>
      </motion.div>
    </div>
  )
}

