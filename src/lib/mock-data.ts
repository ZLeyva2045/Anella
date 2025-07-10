// src/lib/mock-data.ts
import type { Product } from '@/types/firestore';

export interface CustomizationOption {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'radio' | 'image';
    placeholder?: string;
    choices?: string[];
}


export interface ProductDetail extends Product {
    detailedDescription: string;
    customizationOptions?: CustomizationOption[];
}

export const mockCategories = [
  { id: 'botiquines', name: 'Botiquines' },
  { id: 'lamparas', name: 'Lámparas' },
  { id: 'peluches', name: 'Peluches' },
  { id: 'romanticos', name: 'Románticos' },
  { id: 'cumpleanos', name: 'Cumpleaños' },
  { id: 'graduacion', name: 'Graduación' },
];

export const mockThemes = [
  { id: 'harry-potter', name: 'Harry Potter' },
  { id: 'dragon-ball', name: 'Dragon Ball' },
  { id: 'van-gogh', name: 'Van Gogh' },
  { id: 'superheroes', name: 'Superhéroes' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Lámpara de Luna Personalizada',
    description: 'Ilumina tus noches con esta mágica lámpara de luna con tu foto y frase grabada.',
    price: 120.00,
    category: 'lamparas',
    images: ['https://placehold.co/400x300.png', 'https://placehold.co/400x301.png', 'https://placehold.co/400x302.png'],
    isPersonalizable: true,
    createdAt: new Date('2023-10-26T10:00:00Z'),
    updatedAt: new Date('2023-10-26T10:00:00Z'),
    rating: 4.8,
    isNew: true,
    themes: ['romanticos']
  },
  {
    id: '2',
    name: 'Botiquín de Amor de Emergencia',
    description: 'El kit perfecto para curar cualquier mal de amores con dulces y detalles románticos.',
    price: 85.50,
    category: 'botiquines',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: true,
    createdAt: new Date('2023-10-25T11:30:00Z'),
    updatedAt: new Date('2023-10-25T11:30:00Z'),
    rating: 4.9,
    isNew: true,
    themes: ['romanticos']
  },
  {
    id: '3',
    name: 'Peluche de Stitch Gigante',
    description: 'Un adorable y gigante Stitch para abrazar. ¡El regalo perfecto para fans!',
    price: 250.00,
    category: 'peluches',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: false,
    createdAt: new Date('2023-10-24T09:00:00Z'),
    updatedAt: new Date('2023-10-24T09:00:00Z'),
    rating: 4.7,
    isNew: false,
  },
  {
    id: '4',
    name: 'Caja de Cumpleaños Sorpresa',
    description: 'Una caja llena de globos, dulces y un regalo personalizado para celebrar un día especial.',
    price: 150.00,
    category: 'cumpleanos',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: true,
    createdAt: new Date('2023-10-22T14:00:00Z'),
    updatedAt: new Date('2023-10-22T14:00:00Z'),
    rating: 4.6,
    isNew: false,
  },
    {
    id: '5',
    name: 'Lámpara de Superhéroe 3D',
    description: 'Elige tu héroe favorito y ten una lámpara 3D que ilumine tu habitación con su símbolo.',
    price: 95.00,
    category: 'lamparas',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: true,
    createdAt: new Date('2023-11-01T10:00:00Z'),
    updatedAt: new Date('2023-11-01T10:00:00Z'),
    rating: 4.9,
    isNew: true,
    themes: ['superheroes']
  },
  {
    id: '6',
    name: 'Kit de Graduación Exitoso',
    description: 'Celebra el logro con un kit que incluye un trofeo personalizado, dulces y más.',
    price: 180.00,
    category: 'graduacion',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: true,
    createdAt: new Date('2023-10-29T18:00:00Z'),
    updatedAt: new Date('2023-10-29T18:00:00Z'),
    rating: 4.8,
    isNew: false,
  },
  {
    id: '7',
    name: 'Mapa del Merodeador (Lámpara)',
    description: 'Juro solemnemente que mis intenciones no son buenas. Lámpara con el diseño del mapa.',
    price: 130.00,
    category: 'lamparas',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: false,
    createdAt: new Date('2023-10-28T12:00:00Z'),
    updatedAt: new Date('2023-10-28T12:00:00Z'),
    rating: 5.0,
    isNew: false,
    themes: ['harry-potter']
  },
    {
    id: '8',
    name: 'Lámpara Noche Estrellada Van Gogh',
    description: 'Una pieza de arte que ilumina. Lámpara con la icónica pintura de Van Gogh.',
    price: 110.00,
    category: 'lamparas',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: false,
    createdAt: new Date('2023-11-02T15:00:00Z'),
    updatedAt: new Date('2023-11-02T15:00:00Z'),
    rating: 4.9,
    isNew: true,
    themes: ['van-gogh']
  },
  {
    id: '9',
    name: 'Peluche Shenlong Dragon Ball',
    description: 'Convoca al dragón de los deseos con este increíble peluche de Shenlong.',
    price: 190.00,
    category: 'peluches',
    images: ['https://placehold.co/400x300.png'],
    isPersonalizable: false,
    createdAt: new Date('2023-10-20T16:00:00Z'),
    updatedAt: new Date('2023-10-20T16:00:00Z'),
    rating: 4.8,
    isNew: false,
    themes: ['dragon-ball']
  }
];

export const mockProductDetails: ProductDetail[] = mockProducts.map(p => ({
  ...p,
  detailedDescription: p.description + " Este es un texto de descripción más largo que detalla las características, materiales y el proceso de creación de este fantástico producto. Es ideal para convencer al cliente de la calidad y el valor que está a punto de adquirir.",
  customizationOptions: p.isPersonalizable ? [
    { id: 'nombre', label: 'Nombre para Grabar', type: 'text', placeholder: 'Ej: "Para mi amor, María"' },
    { id: 'color-luz', label: 'Color de la Luz', type: 'radio', choices: ['Cálida', 'Fría', 'RGB'] },
    { id: 'foto', label: 'Sube tu Foto', type: 'image'},
    { id: 'dedicatoria', label: 'Dedicatoria Adicional', type: 'textarea', placeholder: 'Escribe aquí un mensaje especial...'},
  ] : undefined,
}));