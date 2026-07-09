import { HeroSection } from "@/components/HeroSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-slate-950">
        <HeroSection />
      </main>
      <SiteFooter />
    </>
  );
}
