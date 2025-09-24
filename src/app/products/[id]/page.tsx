import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getGiftDetails } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetailClient } from '@/components/products/detail/ProductDetailClient';
import { JSX } from 'react';

// Definimos un tipo simple para los parámetros de la URL
interface PageParams {
  id: string;
}

// Definimos las props que recibirá la página
interface ProductDetailPageProps {
  params: PageParams;
}

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


// La firma de tu función es perfecta, la mantenemos
export default async function ProductDetailPage({ params }: ProductDetailPageProps): Promise<JSX.Element> {
  const gift = await getGiftDetails(params.id);

  if (!gift) {
    notFound();
  }
  
  // CORRECCIÓN: Aseguramos que las fechas siempre sean objetos Date.
  // El componente ProductDetailClient espera un objeto Date, pero desde el servidor
  // podemos recibir un Timestamp de Firebase o incluso un string.
  // Esta lógica convierte cualquier formato de fecha en un objeto Date para cumplir con el tipo requerido.
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
