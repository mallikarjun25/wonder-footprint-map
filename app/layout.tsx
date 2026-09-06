import type { Metadata } from "next";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const googleAnalyticsId = "G-2PMPBW7DHS";

export const metadata: Metadata = {
  metadataBase: new URL("https://wonder-footprint-map.netlify.app"),
  title: "The Wonder Footprint | Interactive Location Map",
  description: "An independent interactive analysis of Wonder's location network, automatically refreshed from its public directory.",
  openGraph: { title: "The Wonder Footprint", description: "Location intelligence for Wonder's current and announced footprint", images: [{ url: "/og-v2.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "The Wonder Footprint", description: "Location intelligence for Wonder's current and announced footprint", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
      </body>
    </html>
  );
}
