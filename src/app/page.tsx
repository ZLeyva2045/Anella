import { Header } from "@/components/anella/Header";
import { Footer } from "@/components/anella/Footer";
import { GiftRecommendation } from "@/components/anella/GiftRecommendation";
import { GiftGallery } from "@/components/anella/GiftGallery";
import { HeroSection } from "@/components/anella/HeroSection";
import { GiftPersonalization } from "@/components/anella/GiftPersonalization";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />

        <GiftPersonalization />

        <GiftGallery />

        <GiftRecommendation />

      </main>
      <Footer />
    </div>
  );
}
