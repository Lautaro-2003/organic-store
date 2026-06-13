import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Admin - Orgánico",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
