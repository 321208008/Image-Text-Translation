import Script from 'next/script'

export function AdSense() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  if (!clientId) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-ad-client={clientId}
    />
  )
} 