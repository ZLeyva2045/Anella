// src/app/products/[id]/page.tsx
import { Timestamp } from 'firebase/firestore';
import { getGiftDetails } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';

interface PageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // Aseguramos que los Timestamps de Firebase se conviertan en objetos Date de JS
  // para que sean serializables y compatibles con los componentes de cliente.
  const serializableGift = {
    ...gift,
    createdAt: gift.createdAt instanceof Timestamp ? gift.createdAt.toDate() : new Date(gift.createdAt as any),
    updatedAt: gift.updatedAt instanceof Timestamp ? gift.updatedAt.toDate() : new Date(gift.updatedAt as any),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProductDetailClient gift={serializableGift} />
      <Footer />
    </div>
  );
}
