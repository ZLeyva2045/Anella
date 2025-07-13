// src/types/firestore.ts
import type { Timestamp } from 'firebase/firestore';

/**
 * Representa un producto en la colección 'products' de Firestore.
 * Esto funciona como el inventario base.
 */
export interface Product {
  id: string; 
  name: string; 
  description: string; 
  price: number; 
  category: string; 
  images: string[]; 
  createdAt: Date | Timestamp; 
  updatedAt: Date | Timestamp; 
  rating?: number; 
  isNew?: boolean; 
  themes?: string[]; 
  showInWebsite?: boolean;
}

/**
 * Representa un regalo compuesto, que es lo que se vende en la web.
 * Un regalo está hecho de uno o más productos.
 */
export interface Gift {
  id: string; // ID único del regalo
  name: string; // Nombre del regalo, ej: "Cesta de Cumpleaños Deluxe"
  description: string; // Descripción del regalo
  price: number; // Precio final del regalo (puede ser la suma de productos o un precio especial)
  images: string[]; // Fotos del regalo ya ensamblado
  themes?: string[]; // Temáticas asociadas
  products: GiftProduct[]; // Array de productos que componen el regalo
  isPersonalizable: boolean;
  isNew?: boolean;
  rating?: number;
  showInWebsite?: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Representa un producto dentro de un regalo, con su cantidad.
 */
export interface GiftProduct {
  productId: string; // ID del producto del inventario
  name: string; // Nombre del producto para referencia
  quantity: number; // Cantidad de este producto en el regalo
}

/**
 * Representa una categoría en la colección 'categories' de Firestore.
 */
export interface Category {
  id: string; // ID único autogenerado por Firestore
  name: string; // Nombre de la categoría, ej: "Lámparas"
}

/**
 * Representa una temática en la colección 'themes' de Firestore.
 */
export interface Theme {
    id: string; // ID único autogenerado por Firestore
    name: string; // Nombre de la temática, ej: "Harry Potter"
}


/**
 * Representa un pedido en la colección 'orders' de Firestore.
 */
export interface Order {
  id: string; // ID único del pedido
  userId: string; // ID del usuario que realizó el pedido
  sellerId?: string; // ID del vendedor que gestionó el pedido (opcional)
  items: OrderItem[]; // Array de productos o regalos en el pedido
  customerInfo: { // Información del cliente
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Estado del pedido
  paymentMethod: 'creditCard' | 'paypal' | 'bankTransfer'; // Método de pago
  deliveryMethod: 'storePickup' | 'homeDelivery'; // Método de entrega
  createdAt: Date | Timestamp; // Fecha de creación del pedido
  totalAmount: number; // Monto total del pedido
}

/**
 * Representa un item (producto o regalo) dentro de un pedido.
 */
export interface OrderItem {
  itemId: string; // ID del producto o regalo
  name: string;
  price: number;
  quantity: number; 
  image: string;
  personalization?: { [key: string]: any }; // Detalles de personalización (opcional)
}

/**
 * Representa un usuario en la colección 'users' de Firestore.
 */
export interface User {
  id: string; // ID único del usuario (coincide con el UID de Firebase Auth)
  email: string; // Email del usuario
  name: string; // Nombre del usuario
  phone: string; // Teléfono del usuario
  address: string; // Dirección del usuario
  dni_ruc?: string; // DNI o RUC del cliente
  birthDate?: Date | Timestamp; // Fecha de nacimiento
  orders: string[]; // Array de IDs de los pedidos del usuario
  role?: 'customer' | 'manager' | 'sales' | 'designer' | 'manufacturing' | 'creative'; // Rol del usuario
  photoURL?: string; // foto del usuario
  loyaltyPoints?: number; // Puntos de fidelidad
}
