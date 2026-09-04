import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Task Tracker application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <nav className="p-4 border-b">
          <Link href="/">Home</Link>{" | "}
          <Link href="/tasks">Tasks</Link>{" | "}
          <Link href="/about">About</Link>{" | "}
          <Link href="/register">Register</Link>{" | "}
          <Link href="/login">Login</Link>{" | "}
          <Link href="/profile">Profile</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}