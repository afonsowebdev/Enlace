import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Italiana } from "next/font/google";
import "./globals.css";

const italiana = Italiana({
  variable: "--font-italiana",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enlace",
  description: "Convite de casamento: data, local, resposta, presentes e memórias.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1527" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${italiana.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
