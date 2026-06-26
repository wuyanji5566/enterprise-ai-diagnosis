"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/diagnosis", label: "AI诊断" },
  { href: "/samples", label: "样品库" },
  { href: "/services", label: "服务方案" },
  { href: "/admin", label: "后台" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
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
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
          <Link href="/services#consultation" className="ml-2 text-sm font-semibold text-brand">
            预约沟通
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/diagnosis"
              onClick={() => setOpen(false)}
              className="primary-button mt-2 sm:hidden"
            >
              开始AI诊断
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
