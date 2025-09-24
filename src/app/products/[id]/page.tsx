// src/app/products/[id]/page.tsx
import { Timestamp } from 'firebase/firestore';
import { getGiftDetails } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // Convert Timestamps to serializable strings (ISO strings) before passing to a Client Component.
  const serializableGift = {
    ...gift,
    createdAt: gift.createdAt instanceof Timestamp ? gift.createdAt.toDate().toISOString() : new Date(gift.createdAt as any).toISOString(),
    updatedAt: gift.updatedAt instanceof Timestamp ? gift.updatedAt.toDate().toISOString() : new Date(gift.updatedAt as any).toISOString(),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProductDetailClient gift={serializableGift} />
      <Footer />
    </div>
  );
}
