import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GnoseonX — Chat Platform",
  description: "Discord-style real-time chat platform with status, calls & more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col overflow-hidden bg-bg text-text-primary">
        {children}
      </body>
    </html>
  );
}
