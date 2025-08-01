// src/components/anella/HeroSection.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  const heroImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBBmepZ4vywjzbZSwDzf2wmUyW4ovLs0Jxyzm003ryyUUJ5TaqpkCdWd5HUHNCKA_fsGqybs5XGLnH98QspijCA9D4CdjZbyUGIpByQHvy641LTFhyC6M-MMhn8pEZdD4SZ_NhG5f9EoeRqgOZLvQ8_cKfBnv45oJraCDIRnqgwuwYyF6bGCxkPwd1SBt6oBlaKSDJL8OrE6oNri95Pa6DAvJkSKkf33J_nJHW5py0TnE0NQDiAPABtKvTFSJsPep_qAc0YJ5FLHCBb";

  return (
     <section className="px-4 py-16 sm:px-8 lg:px-16 xl:px-40">
        <div className="mx-auto max-w-7xl">
            <div className="relative min-h-[520px] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${heroImageUrl})`}} data-ai-hint="gift giving celebration"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"></div>
                <div className="relative flex flex-col items-center justify-center h-full p-8 text-center text-white">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl lg:text-6xl">Encuentra el regalo perfecto</h1>
                    <p className="mt-4 max-w-2xl text-lg text-gray-200">Explora nuestra colección de regalos cuidadosamente seleccionados para cada ocasión.</p>
                    <Button asChild size="lg" className="mt-8 text-base font-bold shadow-lg transition-transform hover:scale-105">
                        <Link href="/products">
                            <span className="truncate">Ver colección</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    </section>
  );
}
