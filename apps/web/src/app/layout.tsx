import type { Metadata } from "next";
import { Lora, DM_Sans, Cormorant_Garamond } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@kononia/ui/components/sidebar";
import { ClientAuthCheck } from "@/components/client-auth-check";

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
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/app-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#722F37",
  appleWebApp: {
    capable: true,
    title: "ⲔⲞⲚⲞⲚⲒⲀ",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${dmSans.variable} ${cormorant.variable} antialiased overflow-x-hidden`}>
        <Providers>
          <ClientAuthCheck>
            {children}
          </ClientAuthCheck>
        </Providers>
      </body>
    </html>
  );
}