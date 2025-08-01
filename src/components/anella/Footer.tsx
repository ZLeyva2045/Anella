import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          <Link className="text-sm leading-6 text-gray-600 hover:text-primary transition-colors" href="#">Política de privacidad</Link>
          <Link className="text-sm leading-6 text-gray-600 hover:text-primary transition-colors" href="#">Términos de servicio</Link>
          <Link className="text-sm leading-6 text-gray-600 hover:text-primary transition-colors" href="#">Contacto</Link>
        </nav>
        <div className="mt-10 flex justify-center space-x-6">
          <a className="text-gray-400 hover:text-primary transition-colors" href="#">
            <span className="sr-only">Instagram</span>
            <Instagram className="h-6 w-6" />
          </a>
          <a className="text-gray-400 hover:text-primary transition-colors" href="#">
            <span className="sr-only">Facebook</span>
            <Facebook className="h-6 w-6" />
          </a>
          <a className="text-gray-400 hover:text-primary transition-colors" href="#">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">© 2024 Anella. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
