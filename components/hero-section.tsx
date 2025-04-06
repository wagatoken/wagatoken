import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      <div className="absolute inset-0 z-0 web3-grid-bg-animated"></div>

      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-blob"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2 web3-card-glow-border p-8 rounded-xl backdrop-blur-sm bg-black/45">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none web3-dual-gradient-text-glow">
              WAGA Academy
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Empowering the future of coffee through Web3 and blockchain technology
            </p>
          </div>
          <div className="space-x-4 relative z-20">
            <Link href="/courses">
              <Button
                size="lg"
                className="web3-button-glow bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 hover:border-purple-500/50 relative z-20"
              >
                Explore Courses
              </Button>
            </Link>
            <Link href="/summer-camp">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500/30 hover:border-purple-500/60 backdrop-blur animate-purple-border-glow relative z-20"
              >
                Join Summer Camp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

