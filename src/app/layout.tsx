import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "593 Cycling Studio",
  description: "App para el taller de bicicletas 593 Cycling Studio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="es"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
