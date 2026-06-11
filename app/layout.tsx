import type { Metadata } from 'next'
import { Instrument_Serif, Space_Grotesk } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
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

const themeScript = `(function(){try{var h=new Date().getHours();var d=(h>=20||h<7);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
