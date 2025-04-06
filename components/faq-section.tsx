import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ data
const faqs = [
  {
    question: "What is WAGA Academy?",
    answer:
      "WAGA Academy is an educational platform focused on empowering coffee farmers and industry professionals with Web3 knowledge and skills. We provide specialized courses on blockchain technology, DeFi, and sustainable practices for the coffee value chain.",
  },
  {
    question: "Who can take courses at WAGA Academy?",
    answer:
      "Our courses are designed for coffee farmers, cooperative leaders, industry professionals, and anyone interested in the intersection of coffee and Web3 technologies. We offer courses for all skill levels, from beginners to advanced practitioners.",
  },
  {
    question: "Are the courses available online or in-person?",
    answer:
      "We offer both online courses through our digital platform and in-person training through our Summer Camp program and regional workshops. Our online courses are accessible worldwide, while in-person training is currently focused on coffee-producing regions.",
  },
  {
    question: "When will courses be available?",
    answer:
      "Our first cohort of courses will be available in Q4 2025. You can join the waitlist for specific courses to be notified when enrollment opens.",
  },
  {
    question: "How can I participate in the Summer Camp?",
    answer:
      "Our annual Summer Camp in Ethiopia brings together farmers, technologists, and industry experts for intensive training and collaboration. Applications for the Summer Camp open six months before the event. Visit our Summer Camp page to learn more and register your interest.",
  },
  {
    question: "Do you offer scholarships or financial assistance?",
    answer:
      "Yes, we are committed to making education accessible. We offer scholarships for farmers and young professionals from coffee-producing regions. Our partnership programs also enable cooperatives to sponsor members for training.",
  },
  {
    question: "How can organizations partner with WAGA Academy?",
    answer:
      "We collaborate with coffee companies, technology providers, NGOs, and educational institutions. Partners can sponsor courses, provide technical expertise, offer internships, or support our community initiatives. Contact us through our partnership page to explore collaboration opportunities.",
  },
  {
    question: "What technologies do you focus on?",
    answer:
      "We focus on blockchain for traceability, decentralized finance (DeFi) for financial inclusion, tokenization for market access, IoT for farm monitoring, and sustainable farming practices. Our curriculum evolves with technological advancements and industry needs.",
  },
]

export function FAQSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black/30 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 z-0 web3-grid-bg"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Find answers to common questions about WAGA Academy
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="web3-card-purple mb-2 border-purple-500/30">
                <AccordionTrigger className="px-2">
                  <span className="text-base web3-gradient-text text-left">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-2 text-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

