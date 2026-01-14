import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";

const openSans = Open_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Screen Cast",
  description: "Screen Recorder App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.className} antialiased`}
      >
        <QueryProvider>
          <Providers>{children}</Providers>
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
