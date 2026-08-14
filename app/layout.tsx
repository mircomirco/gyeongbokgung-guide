import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GUNG — Guida GPS a Gyeongbokgung",
  description: "Mappa, geolocalizzazione e storie del palazzo reale Gyeongbokgung in italiano.",
  icons: { icon: "./favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f3eee4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
