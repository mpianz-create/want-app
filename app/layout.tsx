import type { Metadata } from 'next'
import { Syne, Space_Grotesk } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WANT* — shop without limits',
  description: 'Your wishlist, but make it fashion. Save anything from any store, organise by vibe, discover with AI.',
}

// Sets the theme attribute before first paint so night-time visitors
// never see a flash of light mode. Runs before React loads.
const themeScript = `(function(){try{var h=new Date().getHours();var d=(h>=20||h<7);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
