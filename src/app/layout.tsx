import React from 'react'

/** Styles */
import '../tailwind.css'
import '../responsive.css'
import '@fontsource/dm-sans/index.css'
import 'react-tabs/style/react-tabs.css'
import '../font.css'
import '../assets/styles/liquidity.scss'
import './globals.scss'
import Layout from '../components/atoms/Layout'


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png"></link>
      </head>
      <body style={{ backgroundColor: '#0f112d' }}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}