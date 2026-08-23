"use client";

import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.push("/login");
  }

  return (
    <InteractiveHoverButton
      onClick={handleSignOut}
      className={
        className ||
        "text-xs py-1.5 px-4 sm:px-5 h-8 bg-transparent border-none"
      }
    >
      Sign Out
    </InteractiveHoverButton>
  );
}
