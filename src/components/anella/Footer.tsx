import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--surface-beige))]">
        <div className="mx-auto max-w-[1200px] px-10">
            <div className="flex flex-col gap-8 py-10 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium" href="#">Política de Privacidad</a>
                    <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium" href="#">Términos de Servicio</a>
                    <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium" href="#">Contacto</a>
                </div>
                <div className="flex justify-center gap-6">
                    <a aria-label="Instagram" className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--dark-gold))] transition-colors" href="#">
                        <Instagram />
                    </a>
                    <a aria-label="Facebook" className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--dark-gold))] transition-colors" href="#">
                       <Facebook />
                    </a>
                    <a aria-label="Twitter" className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--dark-gold))] transition-colors" href="#">
                        <Twitter />
                    </a>
                </div>
                <p className="text-[hsl(var(--secondary-text))] text-sm font-normal leading-normal">© 2025 Anella. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
  );
}
