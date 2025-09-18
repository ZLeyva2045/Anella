// src/app/products/[id]/page.tsx
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getGiftDetails, type GiftDetail } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';

export async function generateStaticParams() {
  const giftsCollection = collection(db, 'gifts');
  const giftsSnapshot = await getDocs(giftsCollection);
  
  const params = giftsSnapshot.docs.map(doc => ({
    id: doc.id,
  }));

  return params;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // Convert Firebase Timestamps to serializable format (JS Date objects)
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
