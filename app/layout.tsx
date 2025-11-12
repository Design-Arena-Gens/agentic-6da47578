import "./globals.css";
import type { Metadata } from "next";
import { SportsProvider } from "@/hooks/useSportsStore";

export const metadata: Metadata = {
  title: "Sports Operations Control",
  description: "Manage fixtures, mapping accuracy, pricing workflows, and collaborative operations across sports."
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className="antialiased">
      <SportsProvider>{children}</SportsProvider>
    </body>
  </html>
);

export default RootLayout;
