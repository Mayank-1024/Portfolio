import { JetBrains_Mono, Space_Grotesk } from "next/font/google"

export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" })
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" })

export const fontVariables = [spaceGrotesk, jetbrainsMono].map((f) => f.variable).join(" ")
