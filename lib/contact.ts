"use client"

import { useState, type FormEvent } from "react"

// Google Apps Script web app (see scripts/contact-mailer.gs): emails each submission and logs it.
const ENDPOINT =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ??
  "https://script.google.com/macros/s/AKfycbzUF2F2LAWQhxr80hVgX4y5e1m1Td64QyevNbILvtSws7cwKCajnJp36Pf2SISiCKp5Ew/exec"

export type ContactStatus = "idle" | "sending" | "sent" | "error"

export function useContactForm() {
  const [status, setStatus] = useState<ContactStatus>("idle")
  const [error, setError] = useState("")

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === "sending") return
    const form = e.currentTarget
    const field = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() ?? ""
    const data = {
      name: field("name"),
      email: field("email"),
      subject: field("subject"),
      message: field("message"),
      company: field("company"), // honeypot
    }

    setStatus("sending")
    setError("")
    try {
      // text/plain keeps this a "simple" CORS request; Apps Script can't answer the preflight a JSON content type triggers.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.ok) throw new Error(body?.error || `Request failed (${res.status})`)
      setStatus("sent")
      form.reset()
    } catch (err) {
      setError((err instanceof Error ? err.message : "Something went wrong").replace(/\.$/, ""))
      setStatus("error")
    }
  }

  return { status, error, onSubmit }
}

/** Off-screen field bots fill in and people never see. */
export const honeypotProps = {
  name: "company",
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true,
  style: { position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 } as const,
}
