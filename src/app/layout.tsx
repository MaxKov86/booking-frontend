import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking — забронювати зустріч",
  description: "Оберіть зручний час для зустрічі",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
