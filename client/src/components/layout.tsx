"use client";

import Header from "@/components/header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="font-lato bg-gray-50 min-h-screen">
      <Header />
      <main>{children}</main>
    </div>
  );
}
