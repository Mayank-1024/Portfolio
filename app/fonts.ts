import { IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google"

export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" })
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" })
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
})
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
})
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
})

export const fontVariables = [spaceGrotesk, jetbrainsMono, plexSans, plexMono, instrumentSerif]
  .map((f) => f.variable)
  .join(" ")
