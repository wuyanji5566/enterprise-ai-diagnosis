"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, QrCode, WechatLogo } from "@phosphor-icons/react";
import { siteConfig } from "@/lib/site-config";

export function ContactCard({
  title = "添加微信，解锁完整诊断报告",
  description = siteConfig.contact.consultationText
}: {
  title?: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(siteConfig.contact.wechatId);
    } catch {
      const input = document.createElement("textarea");
      input.value = siteConfig.contact.wechatId;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.055] shadow-[0_18px_55px_rgba(2,6,23,.24)]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="grid min-h-56 place-items-center border-b border-white/10 bg-slate-950/45 p-6 md:border-b-0 md:border-r">
          {!imageFailed ? (
            <Image
              src={siteConfig.contact.qrCodeUrl}
              alt="企业AI数字工厂微信二维码"
              width={176}
              height={176}
              className="size-44 rounded-2xl border border-white/10 bg-white object-cover p-2"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="grid size-44 place-items-center rounded-2xl border border-dashed border-white/20 bg-white/[.04] p-5 text-center">
              <div>
                <QrCode size={42} className="mx-auto text-cyan-200" weight="duotone" />
                <p className="mt-3 text-xs font-bold leading-5 text-slate-300">
                  微信二维码暂不可用
                  <br />
                  请复制微信号添加
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-7 sm:p-9">
          <span className="ai-eyebrow">
            <WechatLogo size={15} weight="fill" />
            WECHAT CONSULTATION
          </span>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
          <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-xs font-bold text-slate-400">微信号</p>
            <p className="mt-1 break-all font-mono text-base font-black text-white">
              {siteConfig.contact.wechatId}
            </p>
          </div>
          <button type="button" className="ai-primary-button mt-5 w-full" onClick={copyWechat}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "微信号已复制" : "复制微信号"}
          </button>
        </div>
      </div>
    </div>
  );
}
