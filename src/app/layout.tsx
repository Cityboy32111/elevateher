import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElevateHer — Support for Working Mothers",
  description: "A 12-month personalized support program for working mothers through pregnancy, leave, and return to work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
