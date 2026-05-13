import type { Metadata } from "next";
import { Lora, DM_Sans, Cormorant_Garamond } from "next/font/google";
import { headers } from "next/headers";

import "../index.css";
import Providers from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ⲔⲞⲚⲞⲚⲒⲀ",
  description: "Orthodox Christian Family Fasting Companion",
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  themeColor: "#722F37",
  appleWebApp: {
    capable: true,
    title: "ⲔⲞⲚⲞⲚⲒⲀ",
    statusBarStyle: "default",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await authClient.api.getSession();
  const isAuthenticated = !!session?.user;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${dmSans.variable} ${cormorant.variable} antialiased`}>
        <Providers>
          {isAuthenticated ? (
            <div className="flex h-screen">
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          ) : (
            <div className="min-h-screen">{children}</div>
          )}
        </Providers>
      </body>
    </html>
  );
}