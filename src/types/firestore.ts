// src/types/firestore.ts
import type { Timestamp } from 'firebase/firestore';

export const productTypes = [
  'Bienes',
  'Consumibles',
  'Materiales',
  'Empaques',
  'Servicios',
] as const;

export type ProductType = (typeof productTypes)[number];

/**
 * Representa un producto en la colección 'products' de Firestore.
 * Esto funciona como el inventario base.
 */
export interface Product {
  id: string; 
  name: string; 
  description: string; 
  price: number;
  costPrice?: number; // Precio de costo del producto
  category: string; // Nombre de la categoría
  categoryId?: string; // ID de la categoría
  subcategory: string; // Nombre de la subcategoría
  subcategoryId: string; // ID de la subcategoría
  images: string[]; 
  createdAt: Date | Timestamp; 
  updatedAt: Date | Timestamp; 
  rating?: number; 
  stock: number; // Cantidad en inventario
  supplier?: string; // Proveedor del producto (opcional)
  barcode?: string; // Código de barras principal del producto
  productType?: ProductType;
  expirationDate?: Date | Timestamp; // Fecha de vencimiento para consumibles
  isBreakfast?: boolean; // Flag para productos como desayunos que no tienen fecha de vencimiento fija
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
  category?: string; // Categoría principal para filtrado
}

/**
 * Representa un producto dentro de un regalo, con su cantidad.
 */
export interface GiftProduct {
  productId: string; // ID del producto del inventario
  quantity: number; // Cantidad de este producto en el regalo
}

/**
 * Representa una categoría en la colección 'categories' de Firestore.
 */
export interface Category {
  id: string; // ID único autogenerado por Firestore
  name: string; // Nombre de la categoría, ej: "Lámparas"
  order?: number;
  imageUrl?: string;
  description?: string;
  icon?: string; // Nombre del icono de lucide-react
}

/**
 * Representa una subcategoría en la subcolección 'subcategories' de Firestore.
 */
export interface Subcategory {
  id: string; // ID único autogenerado por Firestore
  name: string; // Nombre de la subcategoría
  order?: number;
  imageUrl?: string;
  description?: string;
  icon?: string; // Nombre del icono de lucide-react
}


/**
 * Representa una temática en la colección 'themes' de Firestore.
 */
export interface Theme {
    id: string; // ID único autogenerado por Firestore
    name: string; // Nombre de la temática, ej: "Harry Potter"
}

export type PaymentMethod = 'yapePlin' | 'bankTransfer' | 'card' | 'mercadoPago' | 'paypal' | 'cash';
export type FulfillmentStatus = 'pending' | 'processing' | 'finishing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially-paid' | 'paid' | 'refunded';

export const employeeRoles = ['manager', 'sales', 'designer', 'manufacturing', 'creative'] as const;
export type EmployeeRole = (typeof employeeRoles)[number];
export type UserRole = 'customer' | EmployeeRole;

export const employeeSchedules = ['morning', 'afternoon', 'full-day'] as const;
export type EmployeeSchedule = (typeof employeeSchedules)[number];

/**
 * Representa el detalle de un pago realizado para un pedido.
 */
export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
  date: Timestamp;
  reference?: string; // Opcional, para guardar un ID de transacción
}

/**
 * Detalles de la persona que recibe el envío
 */
export interface DeliveryDetails {
    recipientName: string;
    recipientPhone: string;
    address: string;
    location?: {
        lat: number;
        lng: number;
    };
    reference?: string;
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
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetail[];
  deliveryMethod: 'localPickup' | 'delivery'; // Método de entrega
  deliveryDetails?: DeliveryDetails; // Detalles del envío si es delivery
  shippingCost?: number; // Costo de envío
  createdAt: Timestamp; // Fecha de creación del pedido
  updatedAt: Timestamp; // Fecha de última actualización
  deliveryDate: Timestamp; // Fecha de entrega acordada
  totalAmount: number; // Monto total del pedido (subtotal + shippingCost)
  amountPaid: number; // Suma de los montos en paymentDetails
  amountDue: number; // totalAmount - amountPaid
  pointsAwarded?: boolean; // Flag para saber si ya se otorgaron los puntos de este pedido
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
  role?: UserRole; // Rol del usuario
  schedule?: EmployeeSchedule; // Turno del empleado
  photoURL?: string; // foto del usuario
  loyaltyPoints?: number; // Puntos de fidelidad
  createdAt: Date | Timestamp;
}

/**
 * Represents a specific batch of a purchased product.
 */
export interface Lote {
  id?: string;
  productoId: string;
  cantidadInicial: number;
  cantidadActual: number;
  costoUnitarioCompra: number;
  fechaCompra: Date | Timestamp;
  fechaVencimiento: Date | Timestamp | null;
  codigoBarrasLote?: string;
  estadoLote: 'activo' | 'agotado' | 'vencido';
  idCompra?: string; // Optional reference to a general purchase document
}

export type LoteItem = Omit<Lote, 'id'>;


/**
 * Represents a complete purchase transaction, which may include several lots.
 */
export interface Compra {
  id: string;
  fechaCompra: Date | Timestamp;
  proveedor?: string;
  totalCompra: number;
  compradorId?: string;
  loteIds: string[]; // references to documents in the 'lotes' collection
}

/**
 * Represents an operational expense in the 'expenses' collection.
 */
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Timestamp;
  createdAt: Timestamp;
}


/**
 * Representa un registro de asistencia en la colección 'attendance'.
 */
export interface Attendance {
    id: string;
    employeeId: string; // ID from 'users' collection
    registrarId: string; // ID of the user who performed the scan
    timestamp: Timestamp;
    type: 'check-in' | 'check-out';
    shift: 'morning' | 'afternoon'; // Turno al que corresponde el registro
    status?: 'on-time' | 'late'; // Estado de la puntualidad (solo para check-in)
}

/**
 * Represents a performance evaluation for an employee.
 */
export interface Evaluation {
  id?: string;
  employeeId: string;
  evaluatorId: string;
  period: string; // e.g., "Agosto 2024"
  scores: { [criterionId: string]: number };
  totalScore: number;
  bonus: number;
  comments?: string;
  createdAt: Timestamp;
}

/**
 * Represents a feedback entry for an employee.
 */
export interface Feedback {
  id?: string;
  employeeId: string;
  evaluatorId: string;
  type: 'recognition' | 'improvement';
  comment: string;
  period: string;
  createdAt: Timestamp;
}

/**
 * Represents the attendance status for a single day.
 */
export interface DailyAttendance {
  date: Date;
  status: 'present' | 'absent' | 'incomplete' | 'present_morning' | 'present_afternoon' | 'late';
  morning?: { checkIn?: Timestamp; checkOut?: Timestamp; late?: boolean };
  afternoon?: { checkIn?: Timestamp; checkOut?: Timestamp; late?: boolean };
}

/**
 * Represents the attendance summary for a month.
 */
export interface MonthlyAttendance {
  [day: number]: DailyAttendance;
}

/**
 * Consolidates all data needed for a monthly employee report.
 */
export interface ReportData {
    employee: User;
    period: string; // "Agosto 2024"
    evaluation: Evaluation | null;
    feedback: {
        recognitions: Feedback[];
        improvements: Feedback[];
    };
    attendance: MonthlyAttendance;
    tardinessCount: number;
    tardinessPenalty: number;
}
