import { Header } from "@/components/anella/Header";
import { Footer } from "@/components/anella/Footer";
import { GiftRecommendation } from "@/components/anella/GiftRecommendation";
import { GiftGallery } from "@/components/anella/GiftGallery";
import { HeroSection } from "@/components/anella/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <section
          id="hero"
          className="container mx-auto px-4 py-16 text-center"
        >
          <h1 className="text-6xl md:text-8xl font-headline text-primary mb-4">
            Anella
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Regalos desde el corazón, personalizados para tus momentos especiales.
          </p>
        </section>

        <GiftRecommendation />

        <GiftGallery />

      </main>
      <Footer />
    </div>
  );
