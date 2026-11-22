import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import SiteFooter, { SiteFooterFallback } from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import {
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: `${SITE_NAME} | Toko Pakan Hewan di Salatiga`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: { ...BASE_OPEN_GRAPH, images: [DEFAULT_OG_IMAGE] },
};

// Header and footer live here so they (and the cart count) persist across
// navigations instead of being re-created by every page.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          className="sr-only z-50 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          href="#konten"
        >
          Lewati ke konten
        </a>
        <SiteHeader />
        <main className="flex-1 outline-none" id="konten" tabIndex={-1}>
          {children}
        </main>
        <Suspense fallback={<SiteFooterFallback />}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
