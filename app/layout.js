import "./globals.css";

// ── Viewport (themeColor must live here in Next.js 13+) ──
export const viewport = {
  themeColor: "#c9a84c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// ── Metadata ─────────────────────────────────────────────
export const metadata = {
  title: "CityLens – Discover Bengaluru",
  description: "AI-powered city discovery & mobility app for Bengaluru",
  manifest: "/manifest.json",
  icons: { icon: "/logo.png", apple: "/icons/icon-180.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CityLens",
  },
  icons: {
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
    ],
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CityLens" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#080810" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) { console.log('CityLens SW registered:', reg.scope); })
                  .catch(function(err) { console.log('SW failed:', err); });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}