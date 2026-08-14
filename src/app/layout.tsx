import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getConfiguracao } from "@/lib/config";
import { ConfigProvider } from "@/lib/config-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfiguracao();
  return {
    title: `${config.nomeClinica} - Estética Avançada`,
    description:
      "Sistema de gestão para clínica de estética. Agende seus horários, acompanhe seus tratamentos e muito mais.",
    icons: {
      icon: "/favicon.png",
      apple: "/apple-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfiguracao();

  return (
    <html
      lang="pt-BR"
      data-theme={config.tema}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConfigProvider value={config}>{children}</ConfigProvider>
      </body>
    </html>
  );
}
