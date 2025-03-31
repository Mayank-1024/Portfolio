import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

export const SocialLinks = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="border-purple-700 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 hover:scale-110 transition-all duration-300"
      >
        <Link href="https://github.com/Mayank-1024" target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="border-purple-700 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 hover:scale-110 transition-all duration-300"
      >
        <Link href="https://linkedin.com/in/mayank-bhadrasen-2a2419172" target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-5 w-5" />
          <span className="sr-only">LinkedIn</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="border-purple-700 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 hover:scale-110 transition-all duration-300"
      >
        <Link href="https://x.com/Mbhadrasen" target="_blank" rel="noopener noreferrer">
          <div className="h-5 w-5 flex items-center justify-center">
            <Image src="/images/x-logo-new.webp" alt="X" width={20} height={20} />
          </div>
          <span className="sr-only">X</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="icon"
        asChild
        className="border-purple-700 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 hover:scale-110 transition-all duration-300"
      >
        <Link href="mailto:bhadrasen.m@northeastern.edu">
          <Mail className="h-5 w-5" />
          <span className="sr-only">Email</span>
        </Link>
      </Button>
    </div>
  )
}

