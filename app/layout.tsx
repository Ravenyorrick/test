import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page & Form Builder",
  description: "Build standalone pages and Telegram-enabled forms."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
