import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getGiftDetails } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';

// Genera las rutas estáticas en tiempo de compilación
export async function generateStaticParams() {
  try {
    const giftsCollection = collection(db, 'gifts');
    const giftsSnapshot = await getDocs(giftsCollection);
    
    // Mapea los documentos a la estructura que Next.js espera: [{ id: '...' }, ...]
    const params = giftsSnapshot.docs.map(doc => ({
      id: doc.id,
    }));

    return params;
  } catch (error) {
    console.error("Error fetching static params for products:", error);
    // Devuelve un array vacío en caso de error para evitar que el build falle por completo
    return [];
  }
}

// CORRECCIÓN PRINCIPAL:
// Se simplifica la definición de los props directamente en la firma de la función.
// Este es el formato estándar que Next.js espera para las páginas dinámicas,
// eliminando la necesidad de interfaces separadas y resolviendo el conflicto de tipos.
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // La lógica para asegurar que las fechas sean objetos Date es correcta y se mantiene.
  // El componente ProductDetailClient espera un objeto Date.
  const giftForClient = {
    ...gift,
    createdAt: gift.createdAt instanceof Timestamp ? gift.createdAt.toDate() : new Date(gift.createdAt as any),
    updatedAt: gift.updatedAt instanceof Timestamp ? gift.updatedAt.toDate() : new Date(gift.updatedAt as any),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ProductDetailClient gift={giftForClient} />
      <Footer />
    </div>
  );
}

