import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "VisaVerse Mobility Copilot",
  description: "Onboarding and planning for visa journeys",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
