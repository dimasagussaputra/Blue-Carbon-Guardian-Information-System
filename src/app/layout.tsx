import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blue-carbon-guardian.vercel.app";

export const metadata: Metadata = {
  title: {
    template: "%s | Blue Carbon Guardian",
    default: "Blue Carbon Guardian | Sistem Informasi Konservasi Mangrove Mangkang",
  },
  description:
    "Sistem Informasi Konservasi Mangrove dan Monitoring Estimasi Blue Carbon di Kawasan Pesisir Mangkang - KKN Tematik Universitas Diponegoro 2026.",
  keywords: [
    "Blue Carbon",
    "Mangrove",
    "KKN Tematik",
    "UNDIP",
    "Mangkang",
    "Semarang",
    "Konservasi",
    "Guardian",
    "Sistem Informasi",
    "Karbon Biru",
    "Restorasi Mangrove",
  ],
  authors: [{ name: "KKN Tematik UNDIP 2026" }],
  creator: "KKN Tematik UNDIP 2026",
  publisher: "KKN Tematik UNDIP 2026",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Blue Carbon Guardian",
    title: "Blue Carbon Guardian | Sistem Informasi Konservasi Mangrove",
    description:
      "Sistem Informasi Konservasi Mangrove dan Monitoring Estimasi Blue Carbon di Kawasan Pesisir Mangkang",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blue Carbon Guardian",
    description:
      "Sistem Informasi Konservasi Mangrove dan Monitoring Estimasi Blue Carbon di Kawasan Pesisir Mangkang",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  category: "environment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Blue Carbon Guardian" />
        <meta name="application-name" content="Blue Carbon Guardian" />
        <meta name="theme-color" content="#0a2540" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-green-light selection:text-brand-green-deep"
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("bcg-theme");if(t==="dark"){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(n==='fdprocessedid')return;return p.call(this,n,v)};var o=new MutationObserver(function(m){m.forEach(function(x){if(x.type==='attributes'&&x.attributeName==='fdprocessedid'){x.target.removeAttribute('fdprocessedid')}})});o.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['fdprocessedid']})})()`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
