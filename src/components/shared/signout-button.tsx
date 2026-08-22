'use client'

import { useRouter } from "next/navigation"
import { signOutAction } from "@/actions/auth"

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOutAction()
    router.push("/login")
  }

  return (
    <button
      onClick={handleSignOut}
      className="
        relative px-6 py-3 font-black text-white uppercase tracking-wider
        bg-[#00666B] border-4 border-black rounded-xl
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-150 ease-in-out
        hover:translate-x-[-2px] hover:translate-y-[-2px]
        hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-[2px] active:translate-y-[2px]
        active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      "
    >
      <span className="relative z-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        Sign Out
      </span>
    </button>
  )
}
