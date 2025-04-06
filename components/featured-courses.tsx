import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const featuredCourses = [
  {
    id: 1,
    title: "Blockchain for Coffee Traceability",
    description:
      "Learn how blockchain technology helps record production data for transparency and traceability in the coffee supply chain.",
    category: "Web3 & IT Infrastructure",
    level: "Beginner",
    href: "/courses",
  },
  {
    id: 2,
    title: "DeFi Solutions for Coffee Farmers",
    description:
      "Understand how decentralized finance can provide yield-based lending and financial inclusion for smallholder farmers.",
    category: "Finance & Accounting",
    level: "Intermediate",
    href: "/courses",
  },
  {
    id: 3,
    title: "Sustainable Coffee Farming Practices",
    description:
      "Master agroecology, smart farming tools, and sustainable coffee production methods for improved yields and quality.",
    category: "Coffee Cultivation",
    level: "All Levels",
    href: "/courses",
  },
  {
    id: 4,
    title: "Coffee Tokenization Fundamentals",
    description:
      "Explore how coffee assets can be tokenized to enable fair pricing, financial resources, and global market access.",
    category: "Web3 & IT Infrastructure",
    level: "Intermediate",
    href: "/courses",
  },
]

export function FeaturedCourses() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-purple-950/40 z-0"></div>
      <div className="absolute inset-0 z-0 web3-grid-bg-animated"></div>

      {/* Animated background elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-dual-gradient-text-glow">
              Featured Courses
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Preview our upcoming curriculum designed to empower you with the skills needed in the coffee value chain •
              Launching Q4 2025
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full pt-8">
            {featuredCourses.map((course, index) => {
              // Alternate between emerald and purple card styles
              const isEven = index % 2 === 0
              const cardClass = isEven ? "web3-card-glass" : "web3-card-purple"
              const buttonClass = isEven
                ? "web3-button-glow bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-500/30 hover:border-emerald-500/50"
                : "purple-gradient border border-purple-500/30 hover:border-purple-500/50"
              const badgeClass = isEven
                ? "border-emerald-500/30 bg-emerald-500/10 animate-border-glow"
                : "border-purple-500/30 bg-purple-500/10 animate-purple-border-glow"
              const animationDelay = `animation-delay-${(index + 1) * 100}`

              return (
                <Card
                  key={course.id}
                  className={`${cardClass} flex flex-col h-full transition-all duration-300 animate-fade-in animate-float ${animationDelay}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={`mb-2 ${badgeClass}`}>
                        {course.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`mb-2 ${isEven ? "bg-emerald-500/10 text-emerald-300" : "bg-purple-500/10 text-purple-300"}`}
                      >
                        {course.level}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="line-clamp-4 text-muted-foreground">
                      {course.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={course.href} className="w-full">
                      <Button className={`w-full ${buttonClass} relative z-20`}>View Course</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
          <Link href="/courses" className="mt-8">
            <Button
              variant="outline"
              className="border-opacity-30 hover:border-opacity-60 animate-fade-in animation-delay-500 animate-dual-border-glow bg-gradient-to-r from-emerald-950/30 to-purple-950/30 border-gradient relative z-20"
              style={{
                borderImage: "linear-gradient(to right, rgba(16, 185, 129, 0.5), rgba(147, 51, 234, 0.5))",
                borderImageSlice: 1,
              }}
            >
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

