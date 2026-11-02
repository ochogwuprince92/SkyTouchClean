import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyTouchClean - Clean Spaces. Fresh Clothes. Less Worries.",
  description: "WE CLEAN. WE WASH. WE FUMIGATE. Professional laundry, home cleaning, and fumigation services in Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
