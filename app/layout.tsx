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

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&display=swap"
        />
      </head>

      <body
      suppressHydrationWarning
      className="min-h-screen text-black antialiased"
      >
      {children}
      </body>
    </html>
  );
}