import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const display = Playfair_Display({ variable: "--font-display", subsets: ["latin"], style: ["normal", "italic"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "The Wonder Footprint | Interactive Location Map",
    description: "An independent interactive analysis of Wonder's Northeast location network, based on its public directory.",
    openGraph: { title: "The Wonder Footprint", description: "150 locations · 11 markets · one growing network", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "The Wonder Footprint", description: "150 locations · 11 markets · one growing network", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>;
}
