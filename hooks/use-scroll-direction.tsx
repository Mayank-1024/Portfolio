"use client"

import { useState, useEffect } from "react"

type ScrollDirection = "up" | "down" | null

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [prevScrollY, setPrevScrollY] = useState(0)

  useEffect(() => {
    const threshold = 10
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.scrollY || window.pageYOffset

      if (Math.abs(scrollY - prevScrollY) < threshold) {
        ticking = false
        return
      }

      const newScrollDirection = scrollY > prevScrollY ? "down" : "up"

      setScrollDirection(newScrollDirection)
      setPrevScrollY(scrollY > 0 ? scrollY : 0)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [prevScrollY])

  return scrollDirection
}

