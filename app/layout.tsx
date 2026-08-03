import type { Metadata } from "next";
import { headers } from "next/headers";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og-v2.png`;
  return {
    title: "The Wonder Footprint | Interactive Location Map",
    description: "An independent interactive analysis of Wonder's Northeast location network, based on its public directory.",
    openGraph: { title: "The Wonder Footprint", description: "147 locations · 21 coming soon · 11 markets", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "The Wonder Footprint", description: "147 locations · 21 coming soon · 11 markets", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
