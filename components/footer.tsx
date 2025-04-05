import Link from "next/link"
import { Twitter, Linkedin, Send, MessageSquare, FileText, Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="dual-border-gradient border-t border-emerald-500/20 bg-emerald-950/40 backdrop-blur relative overflow-hidden">
      {/* Background with subtle hexagon pattern */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="hexagon-pattern opacity-5"></div>
      </div>

      <div className="container relative z-10 mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 sm:px-6 lg:px-8">
        {/* Information Grid - make more compact on mobile */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 sm:gap-8">
          {/* Protocol Info Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-gradient-text-glow">WAGA Protocol</h3>
            <p className="text-sm text-muted-foreground">
              Revolutionizing the coffee value chain through blockchain technology, transparency, and financial
              empowerment
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-gradient-text-purple-emerald">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  Key Features
                </Link>
              </li>
              <li>
                <Link href="#roadmap" className="text-sm text-muted-foreground hover:text-purple-300 transition-colors">
                  Development Roadmap
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-purple-300 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/community/dashboard"
                  className="text-sm text-muted-foreground hover:text-purple-300 transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology Column */}
          {/* Community Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-gradient-text-glow">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/community/forums"
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Discussion Forums
                </Link>
              </li>
              <li>
                <Link
                  href="/community/resources"
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Resources Library
                </Link>
              </li>
              <li>
                <Link
                  href="/community/events"
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/community/members"
                  className="text-sm text-muted-foreground hover:text-emerald-300 transition-colors"
                >
                  Member Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium web3-gradient-text-purple-emerald">Contact</h3>
            <p className="text-sm text-muted-foreground">Email: team@wagatoken.io</p>
            <p className="text-sm text-muted-foreground">Based in Ethiopia with a global community</p>
          </div>
        </div>

        {/* Social Media Links - make more compact on mobile */}
        <div className="border-t border-purple-500/20 pt-6 sm:pt-8 mt-6 sm:mt-8 flex flex-col items-center space-y-3 sm:space-y-4">
          <h3 className="text-lg font-medium">
            <span className="bg-gradient-to-r from-purple-500 to-emerald-500 bg-clip-text text-transparent">
              Connect With Us
            </span>
          </h3>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="https://x.com/WagaAcademy"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5 text-emerald-300" />
            </Link>
            <Link
              href="https://linkedin.com/company/waga-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5 text-emerald-300" />
            </Link>
            <Link
              href="https://t.me/wagaprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5 text-emerald-300" />
            </Link>
            <Link
              href="https://discord.gg/wagaprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="Discord"
            >
              <MessageSquare className="h-5 w-5 text-emerald-300" />
            </Link>
            <Link
              href="https://github.com/waga-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5 text-emerald-300" />
            </Link>
            <Link
              href="https://docs.wagaprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="emerald-purple-icon-container p-2 rounded-full hover:scale-110 transition-all duration-300"
              aria-label="Documentation"
            >
              <FileText className="h-5 w-5 text-emerald-300" />
            </Link>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} WAGA Protocol. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

