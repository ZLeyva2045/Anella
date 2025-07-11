// src/lib/mock-data.ts
import type { Product } from '@/types/firestore';
import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

export interface CustomizationChoice {
    name: string;
    priceModifier: number; // 0 for free options
}

export interface CustomizationOption {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'radio' | 'image' | 'select';
    placeholder?: string;
    choices?: CustomizationChoice[];
    priceModifier?: number; // For text/textarea/image inputs
}


export interface ProductDetail extends Product {
    detailedDescription: string;
    customizationOptions?: CustomizationOption[];
}

// Fetching real product data now, but keeping one mock detail for structure reference.
// In a real app, this would also fetch from Firestore.
export async function getProductDetails(productId: string): Promise<ProductDetail | null> {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        return null;
    }

    const product = { id: productSnap.id, ...productSnap.data() } as Product;

    // You could fetch dynamic customization options from another collection here if needed
    const customizationOptions: CustomizationOption[] = product.isPersonalizable ? [
         { id: 'nombre', label: 'Nombre para Grabar (+S/5.00)', type: 'text', placeholder: 'Ej: "Para mi amor, María"', priceModifier: 5 },
         { id: 'color-luz', label: 'Color de la Luz', type: 'radio', choices: [{name: 'Cálida', priceModifier: 0}, {name: 'Fría', priceModifier: 0}, {name: 'RGB (+S/15.00)', priceModifier: 15}] },
         { id: 'foto', label: 'Sube tu Foto (+S/10.00)', type: 'image', priceModifier: 10},
         { id: 'dedicatoria', label: 'Dedicatoria Adicional', type: 'textarea', placeholder: 'Escribe aquí un mensaje especial...', priceModifier: 0},
    ] : [];

    return {
        ...product,
        detailedDescription: product.description + " Este es un texto de descripción más largo que detalla las características, materiales y el proceso de creación de este fantástico producto. Es ideal para convencer al cliente de la calidad y el valor que está a punto de adquirir.",
        customizationOptions,
    };
}
