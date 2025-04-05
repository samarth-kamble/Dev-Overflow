import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AgroVision | Empowering Farmers",
  description: "AI-powered platform for diagnosing plant & cattle diseases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.className}  antialiased`}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
