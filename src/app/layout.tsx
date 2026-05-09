import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendScope - AI Spend Audit",
  description: "Find plan waste, duplicate AI tools, and discounted-credit opportunities before the next invoice."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
