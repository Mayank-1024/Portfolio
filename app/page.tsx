"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Linkedin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TypewriterEffect } from "@/components/typewriter-effect"
import { ParticlesContainer } from "@/components/particles-container"
import { AnimatedSection } from "@/components/animated-section"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { SocialLinks } from "@/components/social-links"
import { SectionParticles } from "@/components/section-particles"

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)
  const scrollDirection = useScrollDirection()
  const introRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Update the typewriter words array with the new phrases
  const words = [
    {
      text: "Decentralized Web Apps",
    },
    {
      text: "Blockchain-Integrated UI/UX",
    },
    {
      text: "AI-Powered Workflows",
    },
    {
      text: "Secure Web3 Solutions",
    },
    {
      text: "Full-Stack Magic with React & Django",
    },
    {
      text: "Smart Contracts in Action",
    },
    {
      text: "Real-Time Crypto Dashboards",
    },
  ]

  const sendToSheet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    const form = e.currentTarget
  
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    }
  
    const res = await fetch("https://script.google.com/macros/s/AKfycbwEuHQvPAXyM9fzKxka1NrZqoZu3oSHDJZQgl3AJ2rEI0jyLQtxBNVFdVetr2bFZwmalw/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  
    if (res.ok) {
      alert("Submitted successfully!")
      form.reset()
    } else {
      alert("Submission failed!")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Purple gradient effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[100px] -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[100px] -z-10"></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-900/10 blur-[120px] -z-10"></div>

      {/* Sticky navbar that shows when scrolling up */}
      <header
        className={`fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-lg transition-transform duration-300 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                Portfolio
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#about" className="transition-colors hover:text-purple-400">
                About
              </Link>
              <Link href="#projects" className="transition-colors hover:text-purple-400">
                Projects
              </Link>
              <Link href="#experience" className="transition-colors hover:text-purple-400">
                Experience
              </Link>
              <Link href="#education" className="transition-colors hover:text-purple-400">
                Education
              </Link>
              <Link href="#contact" className="transition-colors hover:text-purple-400">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <SocialLinks className="hidden md:flex" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Full-screen Intro Section with Particles */}
        <section
          ref={introRef}
          id="intro"
          className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden"
        >
          <ParticlesContainer />

          <div className="container px-4 md:px-6 z-10 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center max-w-4xl mx-auto">
              {/* Hero content with improved spacing and organization */}
              <div className="relative mb-8 p-6 rounded-xl bg-black/30 backdrop-blur-md border border-purple-900/30 hover:border-purple-700/50 transition-all duration-300">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/10 to-transparent rounded-xl"></div>
                <div className="relative z-10 text-center space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                      Mayank Bhadrasen
                    </span>
                  </h1>
                  <div className="h-0.5 w-24 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto my-4"></div>
                  <p className="mx-auto max-w-[700px] text-xl text-gray-300 md:text-2xl">
                    Full-Stack Developer & Web3 Enthusiast
                  </p>
                  <p className="mx-auto max-w-[600px] text-gray-400">
                    Empowering Digital Transformation Through Web development, AI, and blockchain
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-3xl pt-4 mb-10">
                <TypewriterEffect words={words} className="justify-center" />
              </div>

              <div
                className="space-x-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "2s", animationFillMode: "forwards" }}
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-0 text-white hover:scale-105 transition-all duration-300"
                >
                  <Link href="#contact">Contact Me</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-purple-700 text-purple-400 hover:bg-purple-900/20 hover:scale-105 transition-all duration-300"
                >
                  <Link href="#projects">View Projects</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <AnimatedSection id="about" className="w-full py-20 md:py-32 relative">
          <SectionParticles sectionId="about" />
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                    About Me
                  </h2>
                  <p className="max-w-[600px] text-gray-400 text-lg">
                    I'm a graduate student at Northeastern University with a passion for creating high-performance,
                    user-centric web applications. With 2+ years of industry experience, I specialize in front-end
                    frameworks like React.js and backend tools like Django.
                  </p>
                  <p className="max-w-[600px] text-gray-400 text-lg">
                    I'm actively exploring decentralized applications, smart contracts, and emerging technologies in the
                    crypto space. I enjoy solving real-world problems and turning innovative ideas into scalable
                    products.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row items-start">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-0 hover:scale-105 transition-all duration-300"
                  >
                    <Link href="/Mayank_Bhadrasen_MS_Updated.pdf" target="_blank" rel="noopener noreferrer">
                      Download Resume
                    </Link>
                  </Button>
                  <SocialLinks />
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-purple-900/50 bg-black/50 backdrop-blur-sm group transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent"></div>
                <Image
                  src="/images/profile-photo.jpeg"
                  width={600}
                  height={600}
                  alt="Profile"
                  className="mx-auto aspect-square object-cover object-center sm:w-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Projects Section */}
        <AnimatedSection id="projects" className="w-full py-20 md:py-32 relative">
          <SectionParticles sectionId="projects" />
          <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-purple-700/10 blur-[80px] -z-10"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Featured Projects
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">Check out some of my recent work</p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-8 lg:grid-cols-3">
              {/* Project 1 */}
              <Card className="bg-black/50 border border-purple-900/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="text-white">Uniswap V2 – Token Swap UI</CardTitle>
                  <CardDescription className="text-gray-400">Next.js, TypeScript, Tailwind CSS, ethers.js, Chart.js</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg border border-purple-900/30">
                    <Image
                      src="/images/uniswap-v2-dashboard.png"
                      width={500}
                      height={300}
                      alt="Uniswap V2 UI"
                      className="rounded-lg object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Built a decentralized token swap interface and analytics dashboard with wallet connection, token selection,
                    liquidity visualization (x*y=k), swap execution, and historical price charts.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-purple-700 text-purple-400 hover:bg-purple-900/30 hover:scale-105 transition-all duration-300"
                    >
                      <Link 
                      href="https://mayankuniswapv2-ui.vercel.app/" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 group-hover:text-purple-400 transition-colors">
                        Demo
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-purple-700 text-purple-400 hover:bg-purple-900/30 hover:scale-105 transition-all duration-300"
                    >
                      <Link href="https://github.com/Mayank-1024/UniswapV2" target="_blank">
                        Code
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>


              {/* Project 2 */}
              <Card className="bg-black/50 border border-purple-900/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="text-white">NexTap – NFC Wallet System</CardTitle>
                  <CardDescription className="text-gray-400">React, TypeScript, Tailwind CSS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg border border-purple-900/30">
                    <Image
                      src="/images/nextap-project.png"
                      width={500}
                      height={300}
                      alt="NexTap NFC Wallet"
                      className="rounded-lg object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Built a decentralized wallet system using NFC cards and QR codes for login, wallet creation, and
                    transaction approval. Demoed live using NFC-enabled devices.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                  
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-purple-700 text-purple-400 hover:bg-purple-900/30 hover:scale-105 transition-all duration-300"
                    >
                      <Link href="https://github.com/Mayank-1024/NexTap-NFC-App" target="_blank">
                        Code
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Project 3 */}
              <Card className="bg-black/50 border border-purple-900/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="text-white">Emergency Alert App</CardTitle>
                  <CardDescription className="text-gray-400">Java (Swing), Twilio API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg border border-purple-900/30">
                    <Image
                      src="/images/emergency-alert.png"
                      width={500}
                      height={300}
                      alt="Emergency Alert App"
                      className="rounded-lg object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Created a cross-platform safety app that sends location-based SOS alerts via SMS and email,
                    triggered via button (desktop) or motion (mobile). Combined geolocation and gesture detection.
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="border-purple-700 text-purple-400 hover:bg-purple-900/30 hover:scale-105 transition-all duration-300"
                    >
                      <Link href="https://github.com/Mayank-1024/EmergencyAlert_App" target="_blank">
                        Code
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </AnimatedSection>

        {/* Experience Section */}
        <AnimatedSection id="experience" className="w-full py-20 md:py-32 relative">
          <SectionParticles sectionId="experience" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-700/10 blur-[100px] -z-10"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Experience
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">My professional journey</p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-12 py-8">
              {/* Timeline Item 1 */}
              <div className="relative pl-10 pb-10 border-l border-purple-700/30">
                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full -translate-x-4 shadow-lg shadow-purple-900/30">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="space-y-3 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">Assistant Manager of Front-End Development</h3>
                    <span className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                      Nov 2022 – Nov 2023
                    </span>
                  </div>
                  <p className="text-purple-300">AESS Solutions Pvt. Ltd., Bhopal, India</p>
                  <p className="text-gray-400">
                    Migrated legacy HRMS to React.js with Material UI, improving user task efficiency by 25%. Built
                    real-time org charts and calendars using React D3 and Ant Design, increasing scheduling productivity
                    by 30%.
                  </p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative pl-10 border-l border-purple-700/30">
                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full -translate-x-4 shadow-lg shadow-purple-900/30">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="space-y-3 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 transform transition-all duration-300 hover:translate-x-2 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">Associate Software Engineer</h3>
                    <span className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                      Jul 2021 – Nov 2022
                    </span>
                  </div>
                  <p className="text-purple-300">Appright Software Solutions Pvt. Ltd., Bangalore, India</p>
                  <p className="text-gray-400">
                    Developed secure Django REST APIs using OAuth and JWT, improving authentication reliability.
                    Optimized frontend rendering in React + Redux, boosting performance by 15%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Education Section */}
        <AnimatedSection id="education" className="w-full py-20 md:py-32 relative">
          <SectionParticles sectionId="education" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-700/10 blur-[80px] -z-10"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Education
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">My academic background</p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-2">
              {/* Education 1 */}
              <Card className="bg-black/50 border border-purple-900/50 backdrop-blur-sm overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="text-white">Master of Science in Information Systems</CardTitle>
                  <CardDescription className="text-purple-400">2024 - 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-white">Northeastern University, Boston, MA</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Focus: Web Development, Smart Contracts, UX Engineering. Relevant Courses: Application Engineering,
                    Web UX, Cryptocurrency & Smart Contract Engineering.
                  </p>
                </CardContent>
              </Card>

              {/* Education 2 */}
              <Card className="bg-black/50 border border-purple-900/50 backdrop-blur-sm overflow-hidden group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader>
                  <CardTitle className="text-white">Bachelor of Engineering in Information Technology</CardTitle>
                  <CardDescription className="text-purple-400">2017 - 2021</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-white">Shri G.S. Institute of Technology and Science, Indore, India</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Focus: Web Engineering, Data Structures, Artificial Intelligence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection id="contact" className="w-full py-20 md:py-32 relative">
          <SectionParticles sectionId="contact" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-purple-900/5 to-transparent -z-10"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Get In Touch
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl">Have a project in mind? Let's talk!</p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-2">
              <div className="space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                <div>
                  <h3 className="text-xl font-bold text-white">Contact Information</h3>
                  <p className="text-gray-400 mt-2">Feel free to reach out through any of these channels:</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-800/50 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-gray-300 group-hover:text-purple-400 transition-colors">
                      bhadrasen.m@northeastern.edu
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-800/50 transition-colors">
                      <Github className="h-5 w-5" />
                    </div>
                    <Link
                      href="https://github.com/Mayank-1024"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 group-hover:text-purple-400 transition-colors"
                    >
                      github.com/Mayank-1024
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-800/50 transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </div>
                    <Link
                      href="https://linkedin.com/in/mayank-bhadrasen-2a2419172"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 group-hover:text-purple-400 transition-colors"
                    >
                      linkedin.com/in/mayank-bhadrasen-2a2419172
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-800/50 transition-colors">
                      <div className="h-5 w-5 flex items-center justify-center">
                        <Image src="/images/x-logo-new.webp" alt="X" width={20} height={20} />
                      </div>
                    </div>
                    <Link
                      href="https://x.com/Mbhadrasen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 group-hover:text-purple-400 transition-colors"
                    >
                      x.com/Mbhadrasen
                    </Link>
                  </div>
                </div>
              </div>
              <div className="space-y-6 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-900/30 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/20 hover:border-purple-700/70">
                <form onSubmit={sendToSheet} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300">
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your Full Name"
                        className="bg-black/50 border-purple-900/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-purple-700/70 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-black/50 border-purple-900/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-purple-700/70 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-300">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="Project Inquiry"
                      className="bg-black/50 border-purple-900/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-purple-700/70 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-300">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your project..."
                      className="min-h-[120px] bg-black/50 border-purple-900/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 hover:border-purple-700/70 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-0 hover:scale-105 transition-all duration-300"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <footer className="w-full border-t border-white/10 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
            © {new Date().getFullYear()} Mayank Bhadrasen. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </footer>
    </div>
  )
}

