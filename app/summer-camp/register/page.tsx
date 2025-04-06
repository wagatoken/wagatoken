"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

const volunteerFormSchema = z.object({
  role: z.enum(["trainer", "trainee"], {
    required_error: "Please select a role",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  country: z.string().min(2, {
    message: "Please select your country.",
  }),
  expertise: z.string().optional(),
  availability: z.string({
    required_error: "Please select your availability",
  }),
  motivation: z.string().min(50, {
    message: "Motivation must be at least 50 characters.",
  }),
  experience: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
})

export default function VolunteerRegistrationPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<"trainer" | "trainee" | null>(null)

  const form = useForm<z.infer<typeof volunteerFormSchema>>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      expertise: "",
      availability: "",
      motivation: "",
      experience: "",
      termsAccepted: false,
    },
  })

  function onSubmit(values: z.infer<typeof volunteerFormSchema>) {
    // In a real application, this would send the form data to a server
    console.log(values)
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest in the WAGA Summer Camp. We'll be in touch soon.",
    })
  }

  const handleRoleSelect = (selectedRole: "trainer" | "trainee") => {
    setRole(selectedRole)
    form.setValue("role", selectedRole)
    setStep(2)
  }

  return (
    <div className="container max-w-3xl py-12 md:py-24 relative">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
      <div className="space-y-6 relative z-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl web3-gradient-text">
            WAGA Summer Camp Registration
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Join our immersive volunteer program in Ethiopia's coffee-producing regions
          </p>
        </div>

        <Card className="web3-card-featured web3-card-glow">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="web3-gradient-text-vibrant">Choose Your Role</CardTitle>
                <CardDescription>Are you interested in participating as a trainer or trainee?</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Card
                    className={`cursor-pointer hover:border-primary web3-card-purple ${role === "trainer" ? "border-primary" : ""}`}
                    onClick={() => handleRoleSelect("trainer")}
                  >
                    <CardHeader>
                      <CardTitle className="web3-gradient-text-vibrant">Trainer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Share your expertise in Web3, blockchain, DeFi, or sustainable agriculture with smallholder
                        farmers
                      </p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer hover:border-primary web3-card-blue ${role === "trainee" ? "border-primary" : ""}`}
                    onClick={() => handleRoleSelect("trainee")}
                  >
                    <CardHeader>
                      <CardTitle className="web3-gradient-text-vibrant">Trainee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Learn about Web3, blockchain, and digital skills to enhance your coffee farming or processing
                        business
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="web3-gradient-text-vibrant">
                  {role === "trainer" ? "Volunteer as a Trainer" : "Register as a Trainee"}
                </CardTitle>
                <CardDescription>
                  {role === "trainer"
                    ? "Share your expertise and make a real impact on smallholder farmers"
                    : "Learn Web3 and digital skills to enhance your coffee business"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" className="web3-input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" className="web3-input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" type="email" className="web3-input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" className="web3-input" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="web3-input bg-black/50">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-black/90 border-purple-500/30">
                              <SelectItem value="ethiopia">Ethiopia</SelectItem>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="usa">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="germany">Germany</SelectItem>
                              <SelectItem value="france">France</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {role === "trainer" && (
                      <FormField
                        control={form.control}
                        name="expertise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Area of Expertise</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="web3-input bg-black/50">
                                  <SelectValue placeholder="Select your area of expertise" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-black/90 border-purple-500/30">
                                <SelectItem value="blockchain">Blockchain & Web3 Development</SelectItem>
                                <SelectItem value="defi">DeFi & Decentralized Lending</SelectItem>
                                <SelectItem value="supplychain">Supply Chain & IoT</SelectItem>
                                <SelectItem value="smartcontracts">Smart Contracts & Tokenization</SelectItem>
                                <SelectItem value="finance">Financial Inclusion & Crypto Payments</SelectItem>
                                <SelectItem value="agriculture">Sustainable Agriculture & AgriTech</SelectItem>
                                <SelectItem value="marketing">Digital Marketing & Community Building</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {role === "trainee" && (
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience in Coffee Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="web3-input bg-black/50">
                                  <SelectValue placeholder="Select your experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-black/90 border-purple-500/30">
                                <SelectItem value="farmer">Coffee Farmer</SelectItem>
                                <SelectItem value="processor">Coffee Processor</SelectItem>
                                <SelectItem value="cooperative">Cooperative Member</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="web3-input bg-black/50">
                                <SelectValue placeholder="Select your availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-black/90 border-purple-500/30">
                              <SelectItem value="july">July 2024</SelectItem>
                              <SelectItem value="august">August 2024</SelectItem>
                              <SelectItem value="september">September 2024</SelectItem>
                              <SelectItem value="flexible">Flexible (2-4 weeks)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                role === "trainer"
                                  ? "Tell us why you want to volunteer and what you hope to contribute"
                                  : "Tell us why you want to participate and what you hope to learn"
                              }
                              className="min-h-[120px] web3-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I accept the terms and conditions</FormLabel>
                            <FormDescription>
                              By checking this box, you agree to our{" "}
                              <Link href="/terms" className="text-primary underline">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link href="/privacy" className="text-primary underline">
                                Privacy Policy
                              </Link>
                              .
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="web3-button-outline-glow"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="web3-button-glow">
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

