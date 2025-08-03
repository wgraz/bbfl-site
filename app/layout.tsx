// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BBFL",
  description: "Baker Boys Football League Hub",
  icons: {
    icon: "../public/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* 💠 Nav bar */}
        <nav className="w-full bg-white border-b shadow flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            {/* Logo image */}
            <img
              src="/logo.png" // ⬅️ Replace with your actual logo file in /public
              alt="BBFL Logo"
              className="h-15 w-auto"
            />
            {/* League name / Home link */}
            <Link
              href="/"
              className="text-2xl font-extrabold text-blue-700 hover:underline"
            >
              BBFL
            </Link>
          </div>
        </nav>

        {/* Main content */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
