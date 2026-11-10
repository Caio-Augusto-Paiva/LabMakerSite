import { Anton, Inter, Zilla_Slab, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE } from "@/data/areas";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-anton",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});
const zilla = Zilla_Slab({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-zilla",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: "LabMaker — Impressão 3D feita por estudantes",
    template: "%s · LabMaker",
  },
  description: SITE.description,
};

export const viewport = {
  themeColor: "#2960ee",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${anton.variable} ${inter.variable} ${zilla.variable} ${plexMono.variable}`}
    >
      <body>
        <Navbar />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
