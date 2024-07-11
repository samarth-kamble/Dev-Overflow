import type { Metadata } from "next";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spaceGrotesk ",
});

export const metadata: Metadata = {
  title: "DevOverFlow",
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world.",
  icons: {
    icon: "/assets/images/site-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} custom-scrollbar`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
