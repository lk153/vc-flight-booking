import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b1e2d",
};

export const metadata: Metadata = {
  title: "VN Flight Finder - Cheapest Domestic Flights in Vietnam",
  description:
    "Compare prices across all Vietnamese airlines. Find the best deals on domestic flights from Vietnam Airlines, Vietjet, Bamboo Airways, and more.",
  appleWebApp: {
    capable: true,
    title: "VN Flights",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
