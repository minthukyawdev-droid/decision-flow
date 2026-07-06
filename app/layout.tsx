import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DecisionFlow Low-Fidelity Prototype",
  description: "Desktop-first low-fidelity UX wireframe prototype for DecisionFlow",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
