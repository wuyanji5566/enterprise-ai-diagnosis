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
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-white shadow-sm">
              <Factory size={21} weight="duotone" />
            </span>
            <span>
              <span className="block text-[15px] font-bold tracking-tight text-ink sm:text-base">
                {siteConfig.brandName}
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
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
                      ? "bg-slate-100 text-ink"
                      : "text-slate-500 hover:bg-slate-50 hover:text-ink"
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
              className="hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            >
              <UserCircle size={18} weight="duotone" />
              {user ? "我的报告" : "登录"}
            </Link>
            <Link href="/diagnosis" className="primary-button hidden sm:inline-flex">
              开始AI诊断
            </Link>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
              aria-label={open ? "关闭导航" : "打开导航"}
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <X size={20} /> : <List size={21} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden" aria-label="移动导航">
            <div className="mx-auto grid max-w-xl gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Icon size={18} className="text-brand" weight="duotone" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <UserCircle size={18} className="text-brand" weight="duotone" />
                {user ? "我的报告" : "登录 / 注册"}
              </Link>
            </div>
          </nav>
        )}
      </header>

      {showMobileCta && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,.08)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
            <Link href="/diagnosis" className="primary-button min-h-11 px-3 py-2 text-xs">
              <Sparkle size={16} weight="fill" />
              开始AI诊断
            </Link>
            <Link href="/services#consultation" className="secondary-button min-h-11 px-3 py-2 text-xs">
              <ChatCircleText size={16} weight="fill" />
              加微信咨询
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
