import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import { StackProvider, StackTheme } from '@stackframe/stack';

export const metadata: Metadata = {
  title: "Wedding Planner - North Indian Wedding Management",
  description: "Plan and coordinate your North Indian wedding with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <StackProvider>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
