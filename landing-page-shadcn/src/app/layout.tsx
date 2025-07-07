import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fiverr Conversation Extractor - Secure Your Client Communications",
  description: "Extract, backup, and analyze your Fiverr conversations with powerful export tools. Keep your client communications safe and organized.",
  keywords: ["Fiverr", "conversation", "export", "backup", "freelancer", "client", "communication"],
  authors: [{ name: "Fiverr Extractor Team" }],
  creator: "Fiverr Extractor",
  publisher: "Fiverr Extractor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fiverr-extractor.com"),
  openGraph: {
    title: "Fiverr Conversation Extractor",
    description: "Secure your Fiverr conversations with powerful export tools",
    url: "https://fiverr-extractor.com",
    siteName: "Fiverr Extractor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fiverr Conversation Extractor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiverr Conversation Extractor",
    description: "Secure your Fiverr conversations with powerful export tools",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-inter`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
