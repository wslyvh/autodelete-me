
import 'tailwindcss/tailwind.css'
import 'assets/globals.css'
import type { AppProps } from 'next/app'
import Layout from 'components/layout'
import { SEO } from 'components/seo'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <SEO />
      <Component {...pageProps} />
    </Layout>
  )
}
