"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import "./design-switcher.css"

export const DESIGNS = [
  { id: "onchain", label: "On-Chain", href: "/?design=onchain" },
  { id: "blueprint", label: "Blueprint", href: "/?design=blueprint" },
] as const

export type DesignId = (typeof DESIGNS)[number]["id"]

/** Floating tab bar for comparing the candidate designs. Keys 1–2 switch too. */
export function DesignSwitcher({ active }: { active: DesignId }) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return
      const d = DESIGNS[Number(e.key) - 1]
      if (d) router.push(d.href, { scroll: true })
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  return (
    <nav aria-label="Design versions" className="ds">
      <span className="ds__label">Design</span>
      {DESIGNS.map((d, i) => (
        <Link key={d.id} href={d.href} scroll aria-current={d.id === active ? "page" : undefined} className="ds__tab">
          <span className="ds__key">{i + 1}</span>
          {d.label}
        </Link>
      ))}
    </nav>
  )
}
