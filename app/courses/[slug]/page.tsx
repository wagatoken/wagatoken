import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, BookOpen, Calendar, Clock, Coffee, Download, Play } from "lucide-react"
import { CourseWaitlist } from "@/components/course-waitlist"

export default function CoursePage({ params }: { params: { slug: string } }) {
  // Define course data based on the slug
  const getCourseData = (slug: string) => {
    const courses = {
      "blockchain-coffee-traceability": {
        title: "Blockchain for Coffee Traceability",
        description:
          "Learn how blockchain technology helps record production data for transparency and traceability in the coffee supply chain.",
        category: "Web3 & IT Infrastructure",
        level: "Beginner",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Jane Doe",
          title: "Blockchain Specialist",
          avatar: "JD",
        },
        overview: {
          description: [
            "This comprehensive course on Blockchain for Coffee Traceability is designed to equip you with the knowledge and skills needed to implement blockchain-based traceability solutions in the coffee supply chain.",
            "You'll learn how blockchain technology can address key challenges in the coffee industry, from ensuring fair pricing for farmers to providing transparency for consumers. Through practical exercises and real-world case studies, you'll gain hands-on experience in designing and implementing traceability systems.",
          ],
          learningOutcomes: [
            "Fundamentals of blockchain technology and its application in supply chains",
            "How to collect and record production data for transparency and traceability",
            "Implementing smart contracts for automated coffee trading",
            "Integrating IoT devices with blockchain for real-time tracking",
            "Designing consumer-facing interfaces for transparent coffee sourcing",
          ],
          prerequisites:
            "No prior blockchain experience is required, but basic computer literacy and an understanding of supply chain concepts will be helpful.",
        },
        modules: [
          {
            title: "Introduction to Blockchain",
            lessons: [
              { title: "What is Blockchain?", duration: "45 min" },
              { title: "Blockchain vs. Traditional Databases", duration: "60 min" },
              { title: "Key Blockchain Concepts", duration: "75 min" },
              { title: "Quiz: Blockchain Basics", duration: "30 min" },
            ],
          },
          {
            title: "Blockchain for Supply Chain",
            lessons: [
              { title: "Supply Chain Challenges", duration: "60 min" },
              { title: "Blockchain Solutions for Traceability", duration: "90 min" },
              { title: "Case Studies: Blockchain in Agriculture", duration: "75 min" },
              { title: "Assignment: Mapping Coffee Supply Chain", duration: "135 min" },
            ],
          },
          {
            title: "Implementing Traceability",
            lessons: [
              { title: "Data Collection Methods", duration: "75 min" },
              { title: "QR Codes and IoT Integration", duration: "90 min" },
              { title: "Smart Contracts for Coffee Traceability", duration: "105 min" },
              { title: "Practical Exercise: Creating a Simple Tracking System", duration: "180 min" },
            ],
          },
          {
            title: "Consumer Engagement",
            lessons: [
              { title: "Transparency for End Consumers", duration: "60 min" },
              { title: "Building Trust Through Blockchain", duration: "75 min" },
              { title: "Marketing Traceable Coffee", duration: "90 min" },
              { title: "Final Project: Design a Blockchain Traceability Solution", duration: "270 min" },
            ],
          },
        ],
      },
      "defi-coffee-farmers": {
        title: "DeFi Solutions for Coffee Farmers",
        description:
          "Understand how decentralized finance can provide yield-based lending and financial inclusion for smallholder farmers.",
        category: "Finance & Accounting",
        level: "Intermediate",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Sarah Johnson",
          title: "DeFi Specialist",
          avatar: "SJ",
        },
        overview: {
          description: [
            "This innovative course on DeFi Solutions for Coffee Farmers explores how decentralized finance can revolutionize access to capital and financial services for smallholder coffee farmers.",
            "You'll discover how DeFi protocols can create yield-based lending opportunities, enable financial inclusion, and provide risk management tools for farmers traditionally excluded from the banking system. Through case studies and practical applications, you'll learn to design and implement DeFi solutions tailored to agricultural contexts.",
          ],
          learningOutcomes: [
            "Fundamentals of decentralized finance and its potential for unbanked populations",
            "Designing yield-based lending protocols using future harvests as collateral",
            "Creating decentralized insurance solutions for crop and price risks",
            "Implementing stablecoin payment systems for rural communities",
            "Building user-friendly DeFi interfaces for farmers with limited technical knowledge",
          ],
          prerequisites:
            "Basic understanding of blockchain concepts and financial principles is recommended. No coding experience required, though familiarity with smart contracts is helpful.",
        },
        modules: [
          {
            title: "Introduction to DeFi",
            lessons: [
              { title: "What is Decentralized Finance?", duration: "45 min" },
              { title: "Traditional Finance vs. DeFi", duration: "60 min" },
              { title: "Key DeFi Protocols and Platforms", duration: "75 min" },
              { title: "Quiz: DeFi Fundamentals", duration: "30 min" },
            ],
          },
          {
            title: "Financial Inclusion for Farmers",
            lessons: [
              { title: "Challenges in Agricultural Finance", duration: "60 min" },
              { title: "DeFi Solutions for Unbanked Populations", duration: "90 min" },
              { title: "Case Studies: DeFi in Rural Communities", duration: "75 min" },
              { title: "Assignment: Financial Inclusion Strategy", duration: "135 min" },
            ],
          },
          {
            title: "Yield-Based Lending",
            lessons: [
              { title: "Collateralized Lending in DeFi", duration: "75 min" },
              { title: "Future Yield as Collateral", duration: "90 min" },
              { title: "Smart Contracts for Automated Lending", duration: "105 min" },
              { title: "Practical Exercise: Setting Up a Lending Pool", duration: "180 min" },
            ],
          },
          {
            title: "Risk Management",
            lessons: [
              { title: "Price Volatility and Hedging", duration: "60 min" },
              { title: "Insurance Solutions in DeFi", duration: "75 min" },
              { title: "Building Resilient Financial Systems", duration: "90 min" },
              { title: "Final Project: DeFi Solution for Coffee Farmers", duration: "270 min" },
            ],
          },
        ],
      },
      "sustainable-coffee-farming": {
        title: "Sustainable Coffee Farming Practices",
        description:
          "Master agroecology, smart farming tools, and sustainable coffee production methods for improved yields and quality.",
        category: "Coffee Cultivation",
        level: "All Levels",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Abebe Kebede",
          title: "Sustainable Agriculture Expert",
          avatar: "AK",
        },
        overview: {
          description: [
            "This practical course on Sustainable Coffee Farming Practices provides comprehensive training on agroecological methods and smart farming techniques to improve coffee yield, quality, and environmental sustainability.",
            "You'll explore regenerative agriculture principles, climate-smart farming practices, and digital tools that can enhance productivity while preserving biodiversity and ecosystem health. Through virtual field trips and hands-on assignments, you'll develop skills to implement sustainable practices in diverse coffee-growing contexts.",
          ],
          learningOutcomes: [
            "Agroecological principles and their application in coffee farming systems",
            "Soil health management and organic fertilization techniques",
            "Water conservation and efficient irrigation methods",
            "Integrated pest management without synthetic chemicals",
            "Climate adaptation strategies for coffee farms",
            "Digital tools for sustainable farm management",
          ],
          prerequisites:
            "This course is accessible to farmers, agronomists, and coffee professionals of all experience levels. No technical background is required.",
        },
        modules: [
          {
            title: "Principles of Sustainable Agriculture",
            lessons: [
              { title: "Introduction to Agroecology", duration: "45 min" },
              { title: "Biodiversity and Ecosystem Services", duration: "60 min" },
              { title: "Climate-Smart Coffee Production", duration: "75 min" },
              { title: "Quiz: Sustainability Fundamentals", duration: "30 min" },
            ],
          },
          {
            title: "Soil Health and Management",
            lessons: [
              { title: "Soil Biology and Fertility", duration: "60 min" },
              { title: "Composting and Organic Fertilizers", duration: "90 min" },
              { title: "Erosion Control Techniques", duration: "75 min" },
              { title: "Assignment: Soil Management Plan", duration: "135 min" },
            ],
          },
          {
            title: "Water Conservation",
            lessons: [
              { title: "Water Requirements for Coffee", duration: "75 min" },
              { title: "Irrigation Systems and Efficiency", duration: "90 min" },
              { title: "Rainwater Harvesting Techniques", duration: "105 min" },
              { title: "Practical Exercise: Water Management System", duration: "180 min" },
            ],
          },
          {
            title: "Smart Farming Technologies",
            lessons: [
              { title: "Precision Agriculture for Coffee", duration: "60 min" },
              { title: "IoT Sensors for Environmental Monitoring", duration: "75 min" },
              { title: "Data-Driven Decision Making", duration: "90 min" },
              { title: "Final Project: Sustainable Farm Design", duration: "270 min" },
            ],
          },
        ],
      },
      "coffee-tokenization": {
        title: "Coffee Tokenization Fundamentals",
        description:
          "Explore how coffee assets can be tokenized to enable fair pricing, financial resources, and global market access.",
        category: "Web3 & IT Infrastructure",
        level: "Intermediate",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Michael Chen",
          title: "Tokenization Expert",
          avatar: "MC",
        },
        overview: {
          description: [
            "This forward-thinking course on Coffee Tokenization Fundamentals examines how blockchain-based tokenization can transform coffee from a commodity into a digitally-represented asset with enhanced value and market opportunities.",
            "You'll learn how tokenization enables direct farmer-to-consumer relationships, creates new investment models, and establishes verifiable scarcity for premium coffees. Through technical workshops and economic modeling exercises, you'll gain the skills to design and implement tokenization systems for coffee assets.",
          ],
          learningOutcomes: [
            "Fundamentals of asset tokenization and token standards (ERC-20, ERC-721, etc.)",
            "Designing token economics for agricultural commodities",
            "Creating fractional ownership models for coffee harvests",
            "Implementing token-based marketplaces and auctions",
            "Regulatory considerations and compliance frameworks",
            "Integration with physical supply chain and verification systems",
          ],
          prerequisites:
            "Familiarity with blockchain concepts and basic tokenomics is recommended. Some understanding of commodity markets is helpful but not required.",
        },
        modules: [
          {
            title: "Introduction to Asset Tokenization",
            lessons: [
              { title: "What is Tokenization?", duration: "45 min" },
              { title: "Types of Tokens and Standards", duration: "60 min" },
              { title: "Blockchain Platforms for Tokenization", duration: "75 min" },
              { title: "Quiz: Tokenization Basics", duration: "30 min" },
            ],
          },
          {
            title: "Coffee as a Tokenized Asset",
            lessons: [
              { title: "Coffee Value Chain Analysis", duration: "60 min" },
              { title: "Tokenization Models for Agricultural Products", duration: "90 min" },
              { title: "Case Studies: Tokenized Commodities", duration: "75 min" },
              { title: "Assignment: Coffee Token Design", duration: "135 min" },
            ],
          },
          {
            title: "Token Economics",
            lessons: [
              { title: "Pricing Mechanisms and Liquidity", duration: "75 min" },
              { title: "Token Distribution and Governance", duration: "90 min" },
              { title: "Smart Contracts for Token Management", duration: "105 min" },
              { title: "Practical Exercise: Token Economic Model", duration: "180 min" },
            ],
          },
          {
            title: "Market Access and Trading",
            lessons: [
              { title: "Decentralized Exchanges and Marketplaces", duration: "60 min" },
              { title: "Regulatory Considerations", duration: "75 min" },
              { title: "Consumer Engagement with Tokenized Products", duration: "90 min" },
              { title: "Final Project: Coffee Tokenization Platform", duration: "270 min" },
            ],
          },
        ],
      },
      "supply-chain-coffee": {
        title: "Supply Chain Management for Coffee",
        description:
          "Learn comprehensive knowledge in logistics, procurement, and distribution for seamless operations across the coffee value chain.",
        category: "Supply Chain Management",
        level: "Intermediate",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "David Rodriguez",
          title: "Supply Chain Specialist",
          avatar: "DR",
        },
        overview: {
          description: [
            "This comprehensive course on Supply Chain Management for Coffee provides a deep dive into the complex logistics, procurement, and distribution systems that bring coffee from farm to cup.",
            "You'll explore traditional and innovative approaches to coffee supply chain management, with special emphasis on efficiency, quality preservation, and sustainability. Through case studies, simulation exercises, and practical tools, you'll develop expertise in optimizing coffee supply chains for various scales of operation.",
          ],
          learningOutcomes: [
            "Mapping and analyzing coffee supply chain structures and stakeholders",
            "Optimizing procurement strategies and direct trade relationships",
            "Managing logistics, transportation, and warehousing for green coffee",
            "Implementing quality control systems throughout the supply chain",
            "Leveraging technology for supply chain visibility and traceability",
            "Designing resilient supply chains that adapt to disruptions",
          ],
          prerequisites:
            "Basic understanding of business operations is helpful. This course is suitable for coffee professionals, supply chain practitioners, and anyone interested in coffee distribution systems.",
        },
        modules: [
          {
            title: "Coffee Supply Chain Fundamentals",
            lessons: [
              { title: "Global Coffee Value Chain Overview", duration: "45 min" },
              { title: "Stakeholders and Their Roles", duration: "60 min" },
              { title: "Supply Chain Challenges in Coffee", duration: "75 min" },
              { title: "Quiz: Supply Chain Basics", duration: "30 min" },
            ],
          },
          {
            title: "Procurement and Sourcing",
            lessons: [
              { title: "Direct Trade Models", duration: "60 min" },
              { title: "Quality Assessment and Grading", duration: "90 min" },
              { title: "Ethical Sourcing Practices", duration: "75 min" },
              { title: "Assignment: Sourcing Strategy", duration: "135 min" },
            ],
          },
          {
            title: "Logistics and Distribution",
            lessons: [
              { title: "Transportation and Shipping", duration: "75 min" },
              { title: "Warehousing and Inventory Management", duration: "90 min" },
              { title: "Export/Import Regulations", duration: "105 min" },
              { title: "Practical Exercise: Logistics Planning", duration: "180 min" },
            ],
          },
          {
            title: "Digital Supply Chain",
            lessons: [
              { title: "Supply Chain Visibility Systems", duration: "60 min" },
              { title: "Blockchain for Traceability", duration: "75 min" },
              { title: "Data Analytics for Supply Chain Optimization", duration: "90 min" },
              { title: "Final Project: Digital Supply Chain Strategy", duration: "270 min" },
            ],
          },
        ],
      },
      "digital-marketing-coffee": {
        title: "Web3 Digital Marketing for Coffee Brands",
        description:
          "Build expertise in branding, customer loyalty, and positioning of tokenized coffee for global markets.",
        category: "Marketing & Sales",
        level: "Beginner",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Maria Garcia",
          title: "Web3 Marketing Strategist",
          avatar: "MG",
        },
        overview: {
          description: [
            "This innovative course on Web3 Digital Marketing for Coffee Brands explores how blockchain, NFTs, and decentralized communities can revolutionize coffee marketing and customer engagement.",
            "You'll discover how Web3 technologies enable new forms of brand storytelling, customer loyalty, and direct consumer relationships. Through practical projects and campaign planning exercises, you'll learn to leverage these emerging tools to differentiate coffee brands in competitive markets.",
          ],
          learningOutcomes: [
            "Web3 marketing fundamentals and differences from traditional digital marketing",
            "Creating NFT-based loyalty programs and collectibles for coffee brands",
            "Building engaged communities through token-gated content and experiences",
            "Designing metaverse experiences and virtual coffee shops",
            "Implementing blockchain-verified storytelling about coffee origin and impact",
            "Measuring and optimizing Web3 marketing campaigns",
          ],
          prerequisites:
            "No prior Web3 knowledge is required. Basic marketing experience or understanding is helpful but not necessary.",
        },
        modules: [
          {
            title: "Web3 Marketing Fundamentals",
            lessons: [
              { title: "Traditional vs. Web3 Marketing", duration: "45 min" },
              { title: "Blockchain-Based Marketing Strategies", duration: "60 min" },
              { title: "NFTs and Token-Gated Content", duration: "75 min" },
              { title: "Quiz: Web3 Marketing Basics", duration: "30 min" },
            ],
          },
          {
            title: "Community Building in Web3",
            lessons: [
              { title: "DAOs and Community Governance", duration: "60 min" },
              { title: "Discord and Web3 Social Platforms", duration: "90 min" },
              { title: "Incentive Mechanisms for Engagement", duration: "75 min" },
              { title: "Assignment: Community Strategy", duration: "135 min" },
            ],
          },
          {
            title: "Tokenized Loyalty Programs",
            lessons: [
              { title: "Designing Token-Based Rewards", duration: "75 min" },
              { title: "Smart Contracts for Loyalty Programs", duration: "90 min" },
              { title: "Gamification in Web3 Marketing", duration: "105 min" },
              { title: "Practical Exercise: Loyalty Program Design", duration: "180 min" },
            ],
          },
          {
            title: "Metaverse and Virtual Experiences",
            lessons: [
              { title: "Virtual Coffee Shops and Experiences", duration: "60 min" },
              { title: "Digital Twins for Coffee Products", duration: "75 min" },
              { title: "Storytelling Through Blockchain", duration: "90 min" },
              { title: "Final Project: Web3 Marketing Campaign", duration: "270 min" },
            ],
          },
        ],
      },
      "coffee-quality-control": {
        title: "Coffee Quality Control & Processing",
        description:
          "Develop skills in grading, processing methods, and quality control to ensure top-quality coffee beans.",
        category: "Coffee Processing",
        level: "Intermediate",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Isabella Martinez",
          title: "Q Grader & Processing Expert",
          avatar: "IM",
        },
        overview: {
          description: [
            "This specialized course on Coffee Quality Control & Processing provides comprehensive training on evaluating, processing, and maintaining coffee quality from harvest to export.",
            "You'll master various processing methods, quality assessment techniques, and systems for ensuring consistency and excellence in coffee production. Through sensory training, defect analysis, and processing simulations, you'll develop the skills to maximize coffee quality and value.",
          ],
          learningOutcomes: [
            "Coffee sensory evaluation and cupping protocols",
            "Identifying and preventing coffee defects at various stages",
            "Implementing washed, natural, honey, and experimental processing methods",
            "Managing fermentation for flavor development and consistency",
            "Designing quality control systems for washing stations and mills",
            "Using data to optimize processing decisions and quality outcomes",
          ],
          prerequisites:
            "Basic knowledge of coffee production is helpful. This course is ideal for coffee producers, processors, quality managers, and serious enthusiasts looking to deepen their technical knowledge.",
        },
        modules: [
          {
            title: "Coffee Quality Fundamentals",
            lessons: [
              { title: "Coffee Varieties and Their Characteristics", duration: "45 min" },
              { title: "Factors Affecting Coffee Quality", duration: "60 min" },
              { title: "Sensory Evaluation Basics", duration: "75 min" },
              { title: "Quiz: Quality Fundamentals", duration: "30 min" },
            ],
          },
          {
            title: "Processing Methods",
            lessons: [
              { title: "Washed Processing Techniques", duration: "60 min" },
              { title: "Natural and Honey Processing", duration: "90 min" },
              { title: "Experimental Fermentation Methods", duration: "75 min" },
              { title: "Assignment: Processing Method Comparison", duration: "135 min" },
            ],
          },
          {
            title: "Quality Control Systems",
            lessons: [
              { title: "Sample Roasting and Preparation", duration: "75 min" },
              { title: "Cupping Protocols and Scoring", duration: "90 min" },
              { title: "Defect Analysis and Prevention", duration: "105 min" },
              { title: "Practical Exercise: Quality Control Plan", duration: "180 min" },
            ],
          },
          {
            title: "Digital Quality Management",
            lessons: [
              { title: "Data Collection for Quality Tracking", duration: "60 min" },
              { title: "Blockchain for Quality Verification", duration: "75 min" },
              { title: "AI in Defect Detection", duration: "90 min" },
              { title: "Final Project: Digital Quality Management System", duration: "270 min" },
            ],
          },
        ],
      },
      "iot-coffee-monitoring": {
        title: "IoT for Coffee Farm Monitoring",
        description:
          "Learn how to implement IoT solutions for real-time monitoring of coffee farms and processing facilities.",
        category: "Web3 & IT Infrastructure",
        level: "Advanced",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Thomas Nguyen",
          title: "IoT Solutions Architect",
          avatar: "TN",
        },
        overview: {
          description: [
            "This technical course on IoT for Coffee Farm Monitoring explores how Internet of Things technologies can revolutionize data collection, monitoring, and decision-making in coffee production environments.",
            "You'll learn to design, deploy, and maintain sensor networks that track crucial environmental factors, processing conditions, and quality indicators. Through hands-on projects and case studies, you'll develop the skills to implement IoT solutions that enhance productivity, quality, and sustainability in coffee farming.",
          ],
          learningOutcomes: [
            "Designing sensor networks for environmental monitoring in coffee farms",
            "Implementing low-power, long-range connectivity solutions for rural areas",
            "Creating dashboards and alert systems for real-time farm management",
            "Integrating IoT data with blockchain for supply chain transparency",
            "Developing predictive models for pest management and harvest optimization",
            "Building resilient IoT systems for challenging agricultural environments",
          ],
          prerequisites:
            "Basic understanding of electronics and programming concepts is recommended. Familiarity with coffee farming operations is helpful but not required.",
        },
        modules: [
          {
            title: "IoT Fundamentals for Agriculture",
            lessons: [
              { title: "Introduction to IoT in Agriculture", duration: "45 min" },
              { title: "Sensor Types and Applications", duration: "60 min" },
              { title: "Connectivity Solutions for Rural Areas", duration: "75 min" },
              { title: "Quiz: IoT Basics", duration: "30 min" },
            ],
          },
          {
            title: "Environmental Monitoring",
            lessons: [
              { title: "Climate Monitoring Systems", duration: "60 min" },
              { title: "Soil Moisture and Nutrient Sensors", duration: "90 min" },
              { title: "Weather Prediction and Alerts", duration: "75 min" },
              { title: "Assignment: Environmental Monitoring Plan", duration: "135 min" },
            ],
          },
          {
            title: "Processing Facility Monitoring",
            lessons: [
              { title: "Fermentation Monitoring Systems", duration: "75 min" },
              { title: "Drying Process Optimization", duration: "90 min" },
              { title: "Storage Condition Monitoring", duration: "105 min" },
              { title: "Practical Exercise: Processing Facility IoT Setup", duration: "180 min" },
            ],
          },
          {
            title: "Data Integration and Analytics",
            lessons: [
              { title: "IoT Data Collection and Storage", duration: "60 min" },
              { title: "Blockchain Integration for Data Integrity", duration: "75 min" },
              { title: "Predictive Analytics for Crop Management", duration: "90 min" },
              { title: "Final Project: Comprehensive IoT Monitoring System", duration: "270 min" },
            ],
          },
        ],
      },
      "ethical-coffee-sourcing": {
        title: "Ethical Coffee Sourcing & Sustainability",
        description:
          "Promote ethical sourcing and transparency throughout the coffee supply chain, ensuring sustainability and equity.",
        category: "Sustainability & Ethics",
        level: "All Levels",
        duration: "12 weeks",
        status: "Coming Soon",
        instructor: {
          name: "Elena Morales",
          title: "Sustainability Consultant",
          avatar: "EM",
        },
        overview: {
          description: [
            "This impactful course on Ethical Coffee Sourcing & Sustainability provides a comprehensive framework for creating equitable, environmentally responsible coffee supply chains.",
            "You'll explore various ethical sourcing models, sustainability certification systems, and impact measurement approaches. Through case studies, ethical dilemmas, and practical tools, you'll develop the ability to implement and communicate ethical sourcing practices that benefit farmers, ecosystems, and consumers.",
          ],
          learningOutcomes: [
            "Analyzing ethical challenges in conventional coffee supply chains",
            "Implementing fair trade, direct trade, and relationship coffee models",
            "Calculating and ensuring living income reference prices for farmers",
            "Navigating sustainability certification systems and verification methods",
            "Measuring and communicating social and environmental impact",
            "Designing holistic sustainability programs beyond certification",
          ],
          prerequisites:
            "No prior knowledge required. This course is suitable for coffee professionals, sustainability managers, ethical business practitioners, and conscious consumers.",
        },
        modules: [
          {
            title: "Ethical Sourcing Principles",
            lessons: [
              { title: "Fair Trade and Direct Trade Models", duration: "45 min" },
              { title: "Living Income Reference Prices", duration: "60 min" },
              { title: "Gender Equity in Coffee Production", duration: "75 min" },
              { title: "Quiz: Ethical Sourcing Fundamentals", duration: "30 min" },
            ],
          },
          {
            title: "Environmental Sustainability",
            lessons: [
              { title: "Climate Change and Coffee Production", duration: "60 min" },
              { title: "Agroforestry and Biodiversity", duration: "90 min" },
              { title: "Water Conservation Practices", duration: "75 min" },
              { title: "Assignment: Environmental Impact Assessment", duration: "135 min" },
            ],
          },
          {
            title: "Certification and Verification",
            lessons: [
              { title: "Certification Standards Overview", duration: "75 min" },
              { title: "Blockchain for Verification", duration: "90 min" },
              { title: "Consumer-Facing Transparency", duration: "105 min" },
              { title: "Practical Exercise: Certification Strategy", duration: "180 min" },
            ],
          },
          {
            title: "Social Impact Measurement",
            lessons: [
              { title: "Community Development Initiatives", duration: "60 min" },
              { title: "Impact Metrics and Reporting", duration: "75 min" },
              { title: "Storytelling for Ethical Brands", duration: "90 min" },
              { title: "Final Project: Ethical Sourcing Program", duration: "270 min" },
            ],
          },
        ],
      },
    }

    // Return the course data for the given slug, or a default course if the slug doesn't match
    return courses[slug as keyof typeof courses] || courses["blockchain-coffee-traceability"]
  }

  const course = getCourseData(params.slug)

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/courses" className="link-emerald flex items-center mb-2">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Courses
              </Link>
              <h1 className="text-3xl font-bold tracking-tighter web3-gradient-text-enhanced">{course.title}</h1>
              <p className="text-muted-foreground mt-2">{course.description}</p>
              <div className="mt-2">
                <Badge variant="outline" className="primary-gradient text-white animate-border-glow">
                  Coming Q4 2025
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="badge-emerald">
                {course.category}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
                {course.level}
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
                {course.duration}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/30">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={course.instructor.name} />
                <AvatarFallback className="bg-emerald-900/50">{course.instructor.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.instructor.name}</p>
                <p className="text-sm text-emerald-400">{course.instructor.title}</p>
              </div>
            </div>

            <div className="relative h-[225px] sm:h-[400px] rounded-xl overflow-hidden web3-card-glow-border">
              <Image src="/placeholder.svg?height=400&width=800" alt={course.title} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-emerald-600/90 text-white hover:bg-emerald-600 animate-pulse"
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="curriculum">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold web3-gradient-text">Course Curriculum</h2>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">16</span> lessons • <span className="font-medium">24</span> hours
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {course.modules.map((module, moduleIndex) => (
                      <AccordionItem
                        key={moduleIndex}
                        value={`module-${moduleIndex}`}
                        className="web3-card-glass mb-2 border-emerald-500/30 hover-lift"
                      >
                        <AccordionTrigger className="px-2">
                          <div className="flex justify-between items-center w-full pr-4">
                            <span className="text-base web3-gradient-text">{module.title}</span>
                            <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lessonIndex}
                                className="flex justify-between items-center p-3 rounded-md hover:bg-emerald-500/5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-6 w-6 rounded-full flex items-center justify-center border border-emerald-500/30"></div>
                                  <span>{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3 icon-emerald" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Course Overview</h2>
                  <div className="space-y-4">
                    {course.overview.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    <h3 className="text-lg font-bold mt-6">What You'll Learn</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {course.overview.learningOutcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                    <h3 className="text-lg font-bold mt-6">Prerequisites</h3>
                    <p>{course.overview.prerequisites}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="resources" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Course Resources</h2>
                  <div className="space-y-4">
                    <Card className="web3-card-purple">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Course Slides</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-purple-400" />
                            <span className="text-sm">blockchain_traceability_slides.pdf</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 hover:border-purple-500/60"
                          >
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="web3-card-blue">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Sample Smart Contracts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-blue-400" />
                            <span className="text-sm">coffee_traceability_contracts.zip</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/30 hover:border-purple-500/60"
                          >
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="web3-card-teal">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recommended Reading</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="text-sm">
                            <Link href="#" className="text-primary hover:underline">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit
                            </Link>
                          </li>
                          <li className="text-sm">
                            <Link href="#" className="text-primary hover:underline">
                              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                            </Link>
                          </li>
                          <li className="text-sm">
                            <Link href="#" className="text-primary hover:underline">
                              Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            </Link>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <CourseWaitlist courseName={course.title} />

            <Card className="web3-card-glass hover-lift">
              <CardHeader className="card-header-gradient">
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="primary-gradient text-white animate-border-glow">
                      Coming Q4 2025
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 icon-emerald" />
                    <span className="text-sm">Part of Coffee Value Chain curriculum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 icon-emerald" />
                    <span className="text-sm">Estimated duration: {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 icon-emerald" />
                    <span className="text-sm">Certificate upon completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="web3-card-glass hover-lift">
              <CardHeader className="card-header-gradient">
                <CardTitle>Related Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-6 w-6 icon-emerald" />
                    </div>
                    <div>
                      <Link href="/courses/coffee-tokenization" className="font-medium link-emerald">
                        Coffee Tokenization Fundamentals
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Learn how to tokenize coffee assets for fair pricing and market access
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-6 w-6 icon-emerald" />
                    </div>
                    <div>
                      <Link href="/courses/defi-coffee-farmers" className="font-medium link-emerald">
                        DeFi Solutions for Coffee Farmers
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Explore decentralized finance for yield-based lending and financial inclusion
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-6 w-6 icon-emerald" />
                    </div>
                    <div>
                      <Link href="/courses/iot-coffee-monitoring" className="font-medium link-emerald">
                        IoT for Coffee Farm Monitoring
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Implement IoT solutions for real-time monitoring of coffee farms
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

