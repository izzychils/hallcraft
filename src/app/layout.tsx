import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://hallcraft.xyz"),
  title: "Hallcraft: Event space design, planned to the centimetre",
  description:
    "Design event spaces before they exist. Hallcraft turns a brief into an editable 2D floor plan, seats your guests, and checks the room before the first crate arrives.",
  icons: {
    icon: "/hallcraft-logo.png",
    apple: "/hallcraft-logo.png",
  },
  openGraph: {
    title: "Hallcraft: Event space design, planned to the centimetre",
    description:
      "Design event spaces before they exist. Hallcraft turns a brief into an editable 2D floor plan, seats your guests, and checks the room before the first crate arrives.",
    url: "https://hallcraft.xyz",
    siteName: "Hallcraft",
    type: "website",
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
