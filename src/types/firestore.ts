// src/types/firestore.ts
import type { Timestamp } from 'firebase/firestore';

/**
 * Representa un producto en la colección 'products' de Firestore.
 */
export interface Product {
  id: string; // ID único del producto
  name: string; // Nombre del producto
  description: string; // Descripción detallada del producto
  price: number; // Precio del producto
  category: string; // ID de la categoría principal
  images: string[]; // Array de URLs de las imágenes del producto
  isPersonalizable: boolean; // Indica si el producto se puede personalizar
  createdAt: Date | Timestamp; // Fecha de creación del producto
  updatedAt: Date | Timestamp; // Fecha de la última actualización del producto
  rating?: number; // Valoración promedio del producto
  isNew?: boolean; // Para destacar productos nuevos
  themes?: string[]; // IDs de las temáticas asociadas
}

/**
 * Representa una categoría en la colección 'categories' de Firestore.
 */
export interface Category {
  id: string; // ID único de la categoría
  name: string; // Nombre de la categoría
  subcategories: Subcategory[]; // Array de subcategorías
  displayOrder: number; // Orden en que se muestra la categoría
}

/**
 * Representa una subcategoría dentro de una categoría.
 */
export interface Subcategory {
  id: string; // ID único de la subcategoría
  name: string; // Nombre de la subcategoría
}

/**
 * Representa un pedido en la colección 'orders' de Firestore.
 */
export interface Order {
  id: string; // ID único del pedido
  userId: string; // ID del usuario que realizó el pedido
  products: OrderProduct[]; // Array de productos en el pedido
  customerInfo: { // Información del cliente
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Estado del pedido
  paymentMethod: 'creditCard' | 'paypal' | 'bankTransfer'; // Método de pago
  deliveryMethod: 'storePickup' | 'homeDelivery'; // Método de entrega
  createdAt: Date; // Fecha de creación del pedido
  totalAmount: number; // Monto total del pedido
}

/**
 * Representa un producto dentro de un pedido, con cantidad y posible personalización.
 */
export interface OrderProduct {
  productId: string; // ID del producto
  quantity: number; // Cantidad del producto
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
  orders: string[]; // Array de IDs de los pedidos del usuario
  role?: 'customer' | 'manager' | 'sales' | 'designer' | 'manufacturing' | 'creative'; // Rol del usuario
  photoURL?: string; // foto del usuario
}
