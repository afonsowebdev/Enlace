import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

// Lamoric Rowen (HansCo Studio): letra decorativa, só maiúsculas — nomes e títulos.
const lamoric = localFont({
  src: "../fonts/LamoricRowen.woff2",
  variable: "--font-lamoric",
  weight: "400",
  display: "swap",
});

// Poppins: todo o texto normal (datas, formulários, botões, preços).
const poppins = Poppins({
  variable: "--font-poppins",
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
    { media: "(prefers-color-scheme: light)", color: "#f7f0e7" },
    { media: "(prefers-color-scheme: dark)", color: "#1d0d11" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${lamoric.variable} ${poppins.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
