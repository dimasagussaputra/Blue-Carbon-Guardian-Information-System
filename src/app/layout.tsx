import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Blue Carbon Guardian | Sistem Informasi Konservasi Mangrove Mangkang",
  description: "Sistem Informasi Konservasi Mangrove dan Monitoring Estimasi Blue Carbon di Kawasan Pesisir Mangkang - KKN Tematik Universitas Diponegoro 2026.",
  keywords: ["Blue Carbon", "Mangrove", "KKN Tematik", "UNDIP", "Mangkang", "Konservasi", "Guardian", "Sistem Informasi"],
  authors: [{ name: "KKN Tematik UNDIP 2026" }],
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
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-green-light selection:text-brand-green-deep">
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
