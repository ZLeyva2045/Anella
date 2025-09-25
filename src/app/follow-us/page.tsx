// src/app/follow-us/page.tsx
import { Header } from "@/components/anella/Header";
import { Footer } from "@/components/anella/Footer";
import { FollowUsPageContent } from "@/components/anella/FollowUsPageContent";

export default function FollowUsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Síguenos en Redes Sociales</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Descubre nuestras últimas creaciones, promociones y el detrás de cámaras de Anella.
            </p>
        </div>
        <FollowUsPageContent />
      </main>
      <Footer />
    </div>
  );
}
