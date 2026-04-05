import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { siteMeta } from "@/data/site";
import { themeScript } from "@/lib/theme-script";

import "./globals.css";

const inter = localFont({
  src: [
    { path: "../public/fonts/inter-400.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-500.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/inter-600.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/inter-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: {
    default: `${siteMeta.title} | Product Designer`,
    template: `%s | ${siteMeta.title}`,
  },
  description: siteMeta.description,
  icons: {
    icon: [{ url: "/images/Favicon.png?v=2", type: "image/png" }],
    shortcut: ["/images/Favicon.png?v=2"],
    apple: [{ url: "/images/Favicon.png?v=2" }],
  },
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    url: siteMeta.url,
    siteName: siteMeta.title,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteMeta.title }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground`}>
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
