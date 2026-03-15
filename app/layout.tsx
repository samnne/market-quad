import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// import { getCldOgImageUrl } from "next-cloudinary";
import "./globals.css";
import { NetworkProvider } from "./NetworkProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketQuad",
  description: "A Student Marketplace built for trust and reliability.",
  // openGraph: {
  //   images: getCldOgImageUrl({
  //     src: "a1264fb7b535c514aab9012f1ecfc4",
  //   }),
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-auto  min-h-screen`}
      >
        <NetworkProvider>{children}</NetworkProvider>
      </body>
    </html>
  );
}
