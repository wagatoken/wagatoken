import { HeroSection } from "@/components/hero-section"
import { FeaturedCourses } from "@/components/featured-courses"
import { ValueChainSection } from "@/components/value-chain-section"
import { SummerCampPromo } from "@/components/summer-camp-promo"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <HeroSection />
      <FeaturedCourses />
      <ValueChainSection />
      <SummerCampPromo />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

