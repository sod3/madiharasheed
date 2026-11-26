import type { Metadata } from "next";
import "./globals.css";
import "./public-site.css";

export const metadata: Metadata = {
  title: "Madiha Rasheed | Capability Building & Social Impact",
  description:
    "Explore Madiha Rasheed’s work in capability building, entrepreneurship, leadership, and education in Karachi, Pakistan.",
  referrer: "strict-origin-when-cross-origin",
  icons: { icon: "/favicon.svg" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/cormorant.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/cormorant-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {process.env.GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION} />
        )}
      </head>
      <body id="top">
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
