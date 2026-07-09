"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatCircleText,
  Factory,
  House,
  List,
  Package,
  Sparkle,
  UserCircle,
  X
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: House },
  { href: "/diagnosis", label: "AI诊断", icon: Sparkle },
  { href: "/samples", label: "样品库", icon: Package },
  { href: "/services", label: "服务方案", icon: Factory },
  { href: "/services#consultation", label: "预约沟通", icon: ChatCircleText }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.includes("#")) return pathname === href.split("#")[0];
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const showMobileCta =
    !pathname.startsWith("/diagnosis") &&
    !pathname.startsWith("/result") &&
    !pathname.startsWith("/admin");

  useEffect(() => {
    let active = true;
    fetch("/api/user/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: { name: string; email: string } | null }) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/[.88] text-white backdrop-blur-xl">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-500 text-white shadow-[0_0_24px_rgba(56,189,248,.32)]">
              <Factory size={21} weight="duotone" />
            </span>
            <span>
              <span className="block text-[15px] font-black tracking-tight text-white sm:text-base">
                {siteConfig.brandName}
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/70 sm:block">
                AI Delivery System
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white/10 text-cyan-100"
                      : "text-slate-300 hover:bg-white/[.08] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={user ? "/account" : "/login"}
              className="hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.06] px-4 py-2 text-sm font-bold text-slate-100 transition hover:bg-white/10 sm:inline-flex"
            >
              <UserCircle size={18} weight="duotone" />
              {user ? "我的报告" : "登录"}
            </Link>
            <Link href="/diagnosis" className="ai-primary-button hidden sm:inline-flex">
              开始AI诊断
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-white/10 text-slate-100 lg:hidden"
              aria-label={open ? "关闭导航" : "打开导航"}
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <X size={20} /> : <List size={21} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-white/10 bg-slate-950 px-5 py-4 lg:hidden" aria-label="移动导航">
            <div className="mx-auto grid max-w-xl gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[.08]"
                  >
                    <Icon size={18} className="text-cyan-300" weight="duotone" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[.08]"
              >
                <UserCircle size={18} className="text-cyan-300" weight="duotone" />
                {user ? "我的报告" : "登录 / 注册"}
              </Link>
            </div>
          </nav>
        )}
      </header>

      {showMobileCta && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/94 px-4 py-3 shadow-[0_-18px_50px_rgba(2,6,23,.35)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
            <Link href="/diagnosis" className="ai-primary-button min-h-11 px-3 py-2 text-xs">
              <Sparkle size={16} weight="fill" />
              开始AI诊断
            </Link>
            <Link href="/services#consultation" className="ai-secondary-button min-h-11 px-3 py-2 text-xs">
              <ChatCircleText size={16} weight="fill" />
              加微信咨询
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
