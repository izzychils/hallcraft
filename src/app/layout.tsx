import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://hallcraft.online"),
  title: "Hallcraft: Event space design, planned to the centimetre",
  description:
    "Design event spaces before they exist. Hallcraft turns a brief into an editable 2D floor plan, seats your guests, and checks the room before the first crate arrives.",
  icons: {
    icon: "/hallcraft-logo.png",
    apple: "/hallcraft-logo.png",
  },
  keywords: [
    "event floor plan software",
    "event space design",
    "seating plan tool",
    "venue layout planner",
    "wedding floor plan",
    "event planning software",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Design software",
  authors: [{ name: "Hallcraft" }],
  creator: "Hallcraft",
  publisher: "Hallcraft",
  applicationName: "Hallcraft",
  openGraph: {
    title: "Hallcraft: Event space design, planned to the centimetre",
    description:
      "Design event spaces before they exist. Hallcraft turns a brief into an editable 2D floor plan, seats your guests, and checks the room before the first crate arrives.",
    url: "https://hallcraft.online",
    siteName: "Hallcraft",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hallcraft: event space design, planned to the centimetre",
    description:
      "Draw the room, seat the guests, check the spacing and share an exact floor plan with the venue and the team.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hallcraft.online/#organization",
      name: "Hallcraft",
      url: "https://hallcraft.online",
      email: "hello@hallcraft.online",
      description:
        "Hallcraft is a floor plan studio for events: draw the room, seat the guests, check the spacing and share an exact plan.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://hallcraft.online/#website",
      url: "https://hallcraft.online",
      name: "Hallcraft",
      publisher: { "@id": "https://hallcraft.online/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "Hallcraft",
      applicationCategory: "DesignApplication",
      applicationSubCategory: "Event floor plan software",
      operatingSystem: "Web browser",
      url: "https://hallcraft.online",
      description:
        "An editable 2D floor plan studio for events: tables, seating, spacing checks, templates and shareable plans for venues and teams.",
      featureList: [
        "2D floor plan editor",
        "Guest seating",
        "Spacing and capacity checks",
        "Event templates",
        "Shareable plan links",
        "Export for venues",
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
