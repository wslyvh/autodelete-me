import 'tailwindcss/tailwind.css'
import 'assets/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { Layout } from 'components/layout'
import { SEO } from 'components/seo'

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps } }: AppProps) {
  return <SessionProvider session={session}>
    <Layout>
      <SEO />
      <Component {...pageProps} />
    </Layout>
  </SessionProvider>
}
