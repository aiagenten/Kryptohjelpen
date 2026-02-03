import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kryptohjelpen - Teknisk veiledning for krypto, metaverse og Web3",
  description: "Vi tilbyr teknisk veiledning innen krypto, metaverse og Web3. Ingen investeringsråd - bare kunnskap og støtte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        {/* Trustpilot script loaded by TrustpilotWidget component */}
      </head>
      <body className={inter.className}>
        <Nav />
        <main>{children}</main>
        <Footer />
        <Chatbot />
        {/* Site Monitor */}
        <Script 
          src="https://site-monitor-production-54bc.up.railway.app/dist/monitor.min.js"
          data-site-id="kryptohjelpen.no"
          data-api-endpoints="/api/health"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
