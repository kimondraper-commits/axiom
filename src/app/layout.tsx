import type { Metadata } from "next";
import { Open_Sans, PT_Mono } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});
const ptMono = PT_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pt-mono",
});

export const metadata: Metadata = {
  title: "AXIOM — Planning Platform",
  description: "Professional GIS maps, AI planning assistant, and project collaboration for city planners.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${ptMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
