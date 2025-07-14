// src/lib/mock-data.ts
import type { Product, Gift } from '@/types/firestore';
import { doc, getDoc } from 'firebase/firestore';
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

// Renamed to represent a detailed view of a Gift
export interface GiftDetail extends Gift {
    customizationOptions?: CustomizationOption[];
}

export async function getGiftDetails(giftId: string): Promise<GiftDetail | null> {
    const giftRef = doc(db, 'gifts', giftId);
    const giftSnap = await getDoc(giftRef);

    if (!giftSnap.exists()) {
        return null;
    }

    const giftData = { id: giftSnap.id, ...giftSnap.data() } as Gift;

    // You could fetch dynamic customization options from another collection here if needed
    const customizationOptions: CustomizationOption[] = giftData.isPersonalizable ? [
         { id: 'nombre', label: 'Nombre para Grabar (+S/5.00)', type: 'text', placeholder: 'Ej: "Para mi amor, María"', priceModifier: 5 },
         { id: 'color-luz', label: 'Color de la Luz', type: 'radio', choices: [{name: 'Cálida', priceModifier: 0}, {name: 'Fría', priceModifier: 0}, {name: 'RGB (+S/15.00)', priceModifier: 15}] },
         { id: 'foto', label: 'Sube tu Foto (+S/10.00)', type: 'image', priceModifier: 10},
         { id: 'dedicatoria', label: 'Dedicatoria Adicional', type: 'textarea', placeholder: 'Escribe aquí un mensaje especial...', priceModifier: 0},
    ] : [];

    return {
        ...giftData,
        customizationOptions,
    };
}
