import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-secondary/50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold mb-3">Anella Boutique</h3>
            <p className="text-muted-foreground text-sm">
              Creando regalos personalizados con amor desde Cajamarca, Perú.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Contáctanos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hola@anella.pe</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+51 987 771 610</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Jr. El Inca 332, Cajamarca</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Síguenos</h3>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Anella Boutique. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
