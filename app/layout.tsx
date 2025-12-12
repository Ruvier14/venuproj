import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { Providers } from "./providers";
=======
>>>>>>> 7e5d4ff74576e5e84bd7b1907d4ec461256d6109

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venu | Plan less, celebrate more",
  description:
    "Discover curated event venues, manage favorites, and plan your next celebration with Venu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<<<<<<< HEAD
        <Providers>{children}</Providers>
=======
        {children}
>>>>>>> 7e5d4ff74576e5e84bd7b1907d4ec461256d6109
      </body>
    </html>
  );
}
