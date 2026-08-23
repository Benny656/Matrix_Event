import type { Metadata } from "next"
import "./globals.css"
import GrainientBackground from "@/components/shared/GrainientBackground"

export const metadata: Metadata = {
  title: "Matrix · AIML Karunya",
  description: "The event platform for AIML at Karunya University",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme')
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-transparent text-[hsl(var(--text-primary))] relative">
        <GrainientBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}