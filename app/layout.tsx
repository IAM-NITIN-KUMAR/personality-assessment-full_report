import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roots & Routes — Secure Steps",
  description:
    "A personality & career-fit assessment that students actually want to take.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-white text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
