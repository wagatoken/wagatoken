import Link from "next/link"
import { Twitter, Linkedin, Send, MessageSquare, FileText } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-opacity-20 backdrop-blur relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 to-purple-950/80 z-0"></div>

      {/* Subtle animated background elements */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>

      <div className="container py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-dual-gradient-text-glow">WAGA Academy</h3>
            <p className="text-sm text-muted-foreground">
              Empowering the future of coffee through Web3 and blockchain technology
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-gradient-text-glow">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/summer-camp"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Summer Camp
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-purple-gradient-text-glow">Learning Paths</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/courses?category=cultivation"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  Coffee Cultivation
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?category=processing"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  Coffee Processing
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?category=web3"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  Web3 & Blockchain
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?category=finance"
                  scroll={true}
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  DeFi & Finance
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-dual-gradient-text-glow">Contact</h3>
            <p className="text-sm text-muted-foreground">Email: academy@wagatoken.io</p>
            <p className="text-sm text-muted-foreground">Website: www.academy.wagatoken.io</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-8 border-t border-opacity-20 pt-8 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-purple-500/50"></div>
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium web3-dual-gradient-text-enhanced">Connect With Us</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="https://x.com/WagaAcademy"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-emerald-950/50 to-purple-950/50 border border-emerald-500/30 p-3 rounded-full hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors animate-border-glow"
              >
                <Twitter className="h-5 w-5 text-emerald-400" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://www.linkedin.com/company/waga-token-official/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-emerald-950/50 to-purple-950/50 border border-purple-500/30 p-3 rounded-full hover:border-purple-500/60 hover:bg-purple-500/10 transition-colors animate-purple-border-glow animation-delay-100"
              >
                <Linkedin className="h-5 w-5 text-purple-400" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://t.me/wagatoken"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-emerald-950/50 to-purple-950/50 border border-emerald-500/30 p-3 rounded-full hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors animate-border-glow animation-delay-200"
              >
                <Send className="h-5 w-5 text-emerald-400" />
                <span className="sr-only">Telegram</span>
              </Link>
              <Link
                href="https://discord.gg/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-emerald-950/50 to-purple-950/50 border border-purple-500/30 p-3 rounded-full hover:border-purple-500/60 hover:bg-purple-500/10 transition-colors animate-purple-border-glow animation-delay-300"
              >
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <span className="sr-only">Discord</span>
              </Link>
              <Link
                href="https://medium.com/@wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-emerald-950/50 to-purple-950/50 border border-emerald-500/30 p-3 rounded-full hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-colors animate-border-glow animation-delay-400"
              >
                <FileText className="h-5 w-5 text-emerald-400" />
                <span className="sr-only">Medium</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WAGA Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

