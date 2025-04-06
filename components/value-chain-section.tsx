import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coffee, Truck, Factory, ShoppingBag, BarChart3 } from "lucide-react"

const valueChainStages = [
  {
    icon: <Coffee className="h-8 w-8 text-primary" />,
    title: "Coffee Cultivation",
    description: "Sustainable farming practices and blockchain for production data traceability",
    level: "Foundation",
    href: "/courses",
  },
  {
    icon: <Factory className="h-8 w-8 text-primary" />,
    title: "Coffee Processing",
    description: "Quality control, grading, and supply chain management for coffee processing",
    level: "Intermediate",
    href: "/courses",
  },
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Logistics & Distribution",
    description: "International trade, logistics management, and blockchain for supply chain",
    level: "Advanced",
    href: "/courses",
  },
  {
    icon: <ShoppingBag className="h-8 w-8 text-primary" />,
    title: "Roasting & Branding",
    description: "Roasting techniques, digital marketing, and consumer engagement with blockchain",
    level: "All Levels",
    href: "/courses",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Sales & Distribution",
    description: "E-commerce, online sales, and blockchain for product authenticity",
    level: "Specialized",
    href: "/courses",
  },
]

export function ValueChainSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0 web3-grid-bg"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-dual-gradient-text-glow">
              Global Value Chain Approach
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our curriculum is structured around the coffee value chain, providing comprehensive training for every
              stage from farm to cup
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 w-full pt-8">
            {valueChainStages.map((stage, index) => {
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
              const iconClass = isEven ? "text-emerald-400" : "text-purple-400"

              return (
                <Card
                  key={index}
                  className={`${cardClass} flex flex-col h-full transition-all duration-300 animate-fade-in animate-float ${animationDelay} hover:scale-105 hover:shadow-lg`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={`mb-2 ${badgeClass}`}>
                        {stage.title}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`mb-2 ${isEven ? "bg-emerald-500/10 text-emerald-300" : "bg-purple-500/10 text-purple-300"}`}
                      >
                        {stage.level}
                      </Badge>
                    </div>
                    <div
                      className={`flex justify-center mb-4 p-3 rounded-full ${isEven ? "bg-emerald-500/10" : "bg-purple-500/10"} animate-pulse-slow`}
                    >
                      {React.cloneElement(stage.icon, { className: `h-10 w-10 ${iconClass}` })}
                    </div>
                    <CardTitle className={isEven ? "web3-gradient-text" : "web3-purple-gradient-text"}>
                      {stage.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-muted-foreground">{stage.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={stage.href} className="w-full block">
                      <Button className={`w-full ${buttonClass} relative z-20`}>Explore Courses</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

