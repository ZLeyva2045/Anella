// src/components/products/Toolbar.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productCount: number;
}

export function Toolbar({
  searchQuery,
  setSearchQuery,
  productCount
}: ToolbarProps) {
  return (
     <div className="mb-8">
        <h1 className="text-4xl font-bold text-main-text mb-4">Regalos</h1>
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
            <Input
                className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-main-text focus:outline-none focus:ring-2 focus:ring-brand-pink border-none bg-background-surface h-14 placeholder:text-secondary-text px-12 text-base font-normal leading-normal shadow-[inset_4px_4px_10px_#EBDCCD,inset_-4px_-4px_10px_#FFF]"
                placeholder="Buscar regalos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    </div>
  );
}
