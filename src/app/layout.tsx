import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Suriya Mobiles — Premium Mobile Retail & Online Store",
    template: "%s | Suriya Mobiles",
  },
  description:
    "Suriya Mobiles — Your trusted destination for new and second-hand smartphones, tablets, accessories, and expert mobile services.",
  keywords: ["mobile phones", "smartphones", "accessories", "second hand phones", "Suriya Mobiles"],
  authors: [{ name: "Suriya Mobiles" }],
  creator: "Suriya Mobiles",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Suriya Mobiles",
    title: "Suriya Mobiles — Premium Mobile Retail & Online Store",
    description:
      "Shop new and second-hand smartphones, tablets, and accessories at Suriya Mobiles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suriya Mobiles",
    description: "Premium mobile retail and online store.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
