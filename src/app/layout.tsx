import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KoreX",
  description: "Plataforma de Gestión Turística KoreX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
