
// /app/api/products/search/route.ts
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product } from '@/types/firestore';

// Helper function to normalize text for searching
const normalizeText = (text: string = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};


export async function POST(req: Request) {
  try {
    const { recipient, occasion, budget, interests, limit: queryLimit = 6 } = await req.json();

    let productsQuery = query(collection(db, 'products'), where('showInWebsite', '!=', false));
    const snapshot = await getDocs(productsQuery);
    
    let items: Product[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    // Client-side filtering logic based on the query
    if (recipient) {
        const normalizedRecipient = normalizeText(recipient);
        items = items.filter(p => 
            (p.tags || []).some(tag => normalizeText(tag).includes(normalizedRecipient)) ||
            normalizeText(p.description).includes(normalizedRecipient) ||
            normalizeText(p.name).includes(normalizedRecipient)
        );
    }
    
    if (occasion) {
        const normalizedOccasion = normalizeText(occasion);
        items = items.filter(p =>
            (p.tags || []).some(tag => normalizeText(tag).includes(normalizedOccasion)) ||
            normalizeText(p.description).includes(normalizedOccasion)
        );
    }

    if (budget?.max) {
      items = items.filter(p => p.price <= budget.max);
    }
    if (budget?.min) {
      items = items.filter(p => p.price >= budget.min);
    }
    
    if (interests?.length > 0) {
      items = items.filter(p =>
        interests.some((interest: string) => {
            const normalizedInterest = normalizeText(interest);
            return (p.tags || []).some(tag => normalizeText(tag).includes(normalizedInterest)) ||
                   normalizeText(p.description).includes(normalizedInterest);
        })
      );
    }

    // Sort by a simple popularity metric (could be rating or sales count in a real app)
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    items = items.slice(0, queryLimit);

    return NextResponse.json({ ok: true, products: items });
  } catch (err: any) {
    console.error('Search products error', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
