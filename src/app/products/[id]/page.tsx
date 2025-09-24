// src/app/products/[id]/page.tsx
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getGiftDetails } from '@/lib/mock-data'; // Asumo que type GiftDetail no es necesario aquí
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';
import { JSX } from 'react'; // Importamos JSX

// Definimos un tipo simple para los parámetros de la URL
interface PageParams {
  id: string;
}

// Definimos las props que recibirá la página
interface ProductDetailPageProps {
  params: PageParams;
}

// Esta es la firma clave: le decimos a TypeScript explícitamente lo que la función devuelve
export default async function ProductDetailPage({ params }: ProductDetailPageProps): Promise<JSX.Element> {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // Tu lógica de serialización es correcta
  const serializableGift = {
    ...gift,
    createdAt: gift.createdAt instanceof Timestamp ? gift.createdAt.toDate() : gift.createdAt,
    updatedAt: gift.updatedAt instanceof Timestamp ? gift.updatedAt.toDate() : gift.updatedAt,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProductDetailClient gift={serializableGift} />
      <Footer />
    </div>
  );
}