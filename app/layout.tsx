import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { fontVariables } from "@/app/fonts"

export const metadata: Metadata = {
  title: "Mayank Bhadrasen — Full-Stack Developer & AI Automation Engineer",
  description:
    "Portfolio of Mayank Bhadrasen — full-stack developer and AI automation engineer building React/Next.js products, secure API integrations and agentic n8n workflows. Co-founder of Qixazow.",
  metadataBase: new URL("https://mayankbhadrasen.com"),
  openGraph: {
    title: "Mayank Bhadrasen — Portfolio",
    description: "Full-Stack Developer & AI Automation Engineer",
    url: "https://mayankbhadrasen.com",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fontVariables}>{children}</body>
    </html>
  )
}
