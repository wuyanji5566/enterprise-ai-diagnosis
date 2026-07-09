import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.brandName,
    template: `%s · ${siteConfig.brandName}`
  },
  description:
    "从企业AI诊断、样品验证到系统交付，帮助企业找到第一个真正能落地的AI应用场景。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
