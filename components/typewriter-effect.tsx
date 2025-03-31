"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypewriterEffectProps {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
}

// Update the typewriter words to reflect your projects
export const TypewriterEffect = ({ words, className, cursorClassName }: TypewriterEffectProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Current word being typed
      const currentWord = words[currentWordIndex].text

      // If deleting
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        setTypingSpeed(50) // Faster when deleting
      } else {
        // If typing
        setCurrentText(currentWord.substring(0, currentText.length + 1))
        setTypingSpeed(150) // Normal typing speed
      }

      // If word is complete and not deleting, start deleting after a pause
      if (!isDeleting && currentText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500)
      }
      // If word is deleted, move to next word
      else if (isDeleting && currentText === "") {
        setIsDeleting(false)
        setCurrentWordIndex((currentWordIndex + 1) % words.length)
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, typingSpeed, words])

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <span className="inline-block text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300">Specializing in:</span>
      <span className="inline-block text-lg sm:text-xl md:text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 font-bold">
        {currentText}
      </span>
      <span className={cn("inline-block w-1 h-6 md:h-8 bg-purple-500 animate-blink", cursorClassName)} />
    </div>
  )
}

