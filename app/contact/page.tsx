import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none web3-gradient-text">
                Get in Touch
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Have questions about WAGA Academy or interested in partnering with us? We'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl/tight web3-gradient-text">
                  Contact Information
                </h2>
                <p className="text-muted-foreground">
                  Reach out to us through any of the following channels or fill out the form to send us a message.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-purple-500/10 p-2 mt-1">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">academy@wagatoken.io</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold web3-gradient-text">Partnership Opportunities</h3>
                <div className="grid gap-4">
                  <Card className="web3-card-purple">
                    <CardHeader>
                      <CardTitle className="text-lg">Educational Institutions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Partner with us to develop curriculum, host workshops, or create joint research initiatives on
                        Web3 and coffee value chains.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="web3-card-blue">
                    <CardHeader>
                      <CardTitle className="text-lg">Technology Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Collaborate on blockchain solutions, DeFi applications, or IoT implementations for coffee
                        traceability and farmer empowerment.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="web3-card-teal">
                    <CardHeader>
                      <CardTitle className="text-lg">Coffee Industry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Work with us to implement transparent supply chains, fair trade practices, and direct
                        farmer-to-consumer connections.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <Card className="web3-card-featured web3-card-glow">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First name
                      </label>
                      <Input id="first-name" placeholder="Enter your first name" className="web3-input" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last name
                      </label>
                      <Input id="last-name" placeholder="Enter your last name" className="web3-input" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="Enter your email" className="web3-input" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="organization" className="text-sm font-medium">
                      Organization
                    </label>
                    <Input id="organization" placeholder="Enter your organization (optional)" className="web3-input" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="Enter the subject of your message" className="web3-input" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" placeholder="Enter your message" className="min-h-[150px] web3-input" />
                  </div>

                  <Button type="submit" className="web3-button w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 bg-black/30 backdrop-blur relative overflow-hidden">
        <div className="absolute inset-0 z-0 web3-grid-bg"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Common questions about partnering with WAGA Academy
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="web3-card-purple">
              <CardHeader>
                <CardTitle>How can my organization partner with WAGA Academy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer various partnership models including technology collaborations, educational partnerships,
                  funding opportunities, and coffee industry initiatives. Contact us with your specific interests and
                  we'll explore the best fit.
                </p>
              </CardContent>
            </Card>

            <Card className="web3-card-blue">
              <CardHeader>
                <CardTitle>Do you accept volunteers for your programs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! We welcome volunteers with expertise in blockchain, coffee production, education, or community
                  development. Our Summer Camp program particularly benefits from volunteer instructors and mentors.
                </p>
              </CardContent>
            </Card>

            <Card className="web3-card-teal">
              <CardHeader>
                <CardTitle>How can I support WAGA Academy financially?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept donations, grants, and impact investments that align with our mission. All financial support
                  goes directly toward educational programs, technology development, and community initiatives.
                </p>
              </CardContent>
            </Card>

            <Card className="web3-card-pink">
              <CardHeader>
                <CardTitle>Can I visit your programs in Ethiopia?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We occasionally organize visits for partners and supporters to see our work firsthand. Contact us with
                  your interest, and we can discuss possibilities for visiting our programs and meeting the communities
                  we serve.
                </p>
              </CardContent>
            </Card>

            <Card className="web3-card-amber">
              <CardHeader>
                <CardTitle>Do you offer consulting services?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, we provide consulting on blockchain implementation in agricultural supply chains, Web3 education
                  program development, and sustainable coffee production practices. Reach out to discuss your specific
                  needs.
                </p>
              </CardContent>
            </Card>

            <Card className="web3-card-emerald">
              <CardHeader>
                <CardTitle>How quickly can I expect a response?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically respond to all inquiries within 2-3 business days. For urgent matters, please indicate
                  this in your subject line when contacting us.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight web3-gradient-text">
                Ready to Transform Coffee Through Web3?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join us in our mission to empower coffee farmers and create a more equitable, transparent value chain
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="web3-button">
                <Link href="/courses">Explore Our Courses</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-500/30 hover:border-purple-500/60">
                <Link href="/summer-camp/register">Join Summer Camp</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

