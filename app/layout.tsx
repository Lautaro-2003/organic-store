import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappButton from "@/components/WhatsappButton";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Orgánico - Mercado Saludable",
    template: "%s - Orgánico",
  },
  description: "Alimentación consciente y sustentable para tu bienestar.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    siteName: 'Orgánico',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-900 font-sans flex flex-col justify-between">
        
        <AuthProvider>
          <div className="w-full">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
        
        <Footer />
        <WhatsappButton />

      </body>
    </html>
  );
}