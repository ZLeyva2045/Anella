import { Gift } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2">
          <Gift className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline text-primary">Anella</span>
        </a>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <a href="#recommendations" className="hover:text-primary transition-colors">Find a Gift</a>
          <a href="#gallery" className="hover:text-primary transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
