"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

import { DesignSwitcher, type DesignId } from "@/components/designs/design-switcher"
import { OnChain } from "@/components/designs/onchain/onchain"
import { Blueprint } from "@/components/designs/blueprint/blueprint"

function DesignHub() {
  const active: DesignId = useSearchParams().get("design") === "blueprint" ? "blueprint" : "onchain"

  return (
    <>
      {active === "onchain" ? <OnChain key="onchain" /> : <Blueprint key="blueprint" />}
      <DesignSwitcher active={active} />
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <DesignHub />
    </Suspense>
  )
}
