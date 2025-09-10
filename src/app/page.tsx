import { Header } from "@/components/anella/Header";
import { Footer } from "@/components/anella/Footer";
import { GiftRecommendation } from "@/components/anella/GiftRecommendation";
import { GiftGallery } from "@/components/anella/GiftGallery";
import { HeroSection } from "@/components/anella/HeroSection";

export default function Home() {
  return (
    <div className="layout-container flex h-full grow flex-col">
      <Header />
      <main className="flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 px-10">
            <HeroSection />
            <GiftGallery />
            <GiftRecommendation />
        </div>
      </main>
      <Footer />
    </div>
  );
}
