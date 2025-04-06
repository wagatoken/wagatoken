import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-950/30 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 z-0 web3-grid-bg-animated"></div>

      {/* Animated glow effects */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-500/15 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-teal-500/15 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 animate-fade-in web3-card-glow-intense p-8 rounded-xl backdrop-blur-sm">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text-glow">
              Join the WAGA Community Today
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Whether you're a coffee farmer, a Web3 enthusiast, or someone passionate about sustainable agriculture,
              there's a place for you in our ecosystem
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="web3-button-glow animate-fade-in animation-delay-200">
              <Link href="/courses">Join Our Waitlist</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-500/30 hover:border-emerald-500/60 animate-fade-in animation-delay-300 animate-border-glow"
            >
              <Link href="/summer-camp/register">Volunteer for Summer Camp</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

