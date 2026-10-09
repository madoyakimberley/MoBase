import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/Themeprovider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoBase | Developer-First Platform",
  description:
    "Production-hardened lead management and high-velocity edge architecture.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoBase",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased bg-[var(--bg-canvas)] text-[var(--text-primary)]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
