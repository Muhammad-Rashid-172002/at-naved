import type { ReactNode } from "react";
import { ScrollFx } from "@/components/fx/scroll-fx";
import { FloatingWhatsApp } from "@/components/site/floating-whatsapp";
import { Footer } from "@/components/site/footer";
import { MobileCartBar } from "@/components/site/mobile-cart-bar";
import { Navbar } from "@/components/site/navbar";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-cream-soft">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-char focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-[60vh] overflow-x-clip">
        {children}
      </main>
      <Footer />
      <MobileCartBar />
      <FloatingWhatsApp />
      <ScrollFx />
    </div>
  );
}
