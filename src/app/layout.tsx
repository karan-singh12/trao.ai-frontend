import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";

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
    default: "PrepKit.ai — The AI Interview Prep Kit & Studio",
    template: "%s · PrepKit.ai",
  },
  description: "Manage role-specific prep kits, track readiness milestones, and launch active study sessions.",
  icons: {
    icon: [
      { url: "/trao-icon.png", href: "/trao-icon.png" },
      { url: "/favicon.ico", href: "/favicon.ico" }
    ],
    shortcut: "/trao-icon.png",
    apple: "/trao-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>PrepKit.ai — The AI Interview Prep Kit & Studio</title>
        <link rel="icon" type="image/png" href="/trao-icon.png" />
        <link rel="shortcut icon" href="/trao-icon.png" />
        <link rel="apple-touch-icon" href="/trao-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
