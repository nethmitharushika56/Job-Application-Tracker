import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthContext";

export const metadata: Metadata = {
  title: "CareerPulse | Job Application Tracker",
  description: "Track, manage, and optimize your job applications, interviews, and offers in one modern dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-orange-500/20 selection:text-orange-950">
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}