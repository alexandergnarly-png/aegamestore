import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AE Game Store — Premium Game Keys",
  description:
    "AE Game Store menyediakan premium game keys dengan checkout cepat, voucher, VIP benefit, dan support Telegram.",
  metadataBase: new URL("https://aegamestore.com"),
  openGraph: {
    title: "AE Game Store — Premium Game Keys",
    description:
      "Premium game keys, clean checkout, voucher support, and Telegram support.",
    url: "https://aegamestore.com",
    siteName: "AE Game Store",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
