import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wishlist Discovery Engine — Myntra",
  description:
    "An AI discovery engine that mines public conversations to find, quantify and rank the frictions blocking wishlist-to-purchase conversion on Myntra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The dataviz palette is specified against system-ui; no webfont is loaded,
    // which also keeps the page self-contained and fast.
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
