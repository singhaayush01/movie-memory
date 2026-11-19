import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Memory",
  description: "A small home for the movies you love."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
