// src/components/admin/DashboardAlerts.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, CalendarClock, ShoppingCart, Loader2 } from 'lucide-react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product, Order } from '@/types/firestore';
import Link from 'next/link';

const LOW_STOCK_THRESHOLD = 5;
const EXPIRATION_DAYS_THRESHOLD = 30;

interface AlertItemProps {
  icon: React.ElementType;
  title: string;
  count: number;
  linkHref: string;
  linkText: string;
  colorClass: string;
}

const AlertItem = ({ icon: Icon, title, count, linkHref, linkText, colorClass }: AlertItemProps) => {
  if (count === 0) return null;

  return (
    <div className={`flex items-start gap-4 p-3 rounded-lg border-l-4 ${colorClass}`}>
      <Icon className="h-6 w-6 mt-1" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{count} {count === 1 ? 'item necesita' : 'items necesitan'} atención.</p>
        <Button variant="link" asChild className="p-0 h-auto text-sm mt-1">
          <Link href={linkHref}>{linkText}</Link>
        </Button>
      </div>
    </div>
  );
};


export function DashboardAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Low stock listener
    const lowStockQuery = query(
        collection(db, 'products'),
        where('stock', '<=', LOW_STOCK_THRESHOLD)
    );
    const unsubLowStock = onSnapshot(lowStockQuery, (snapshot) => {
        const allLowStock = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        // Filter out services on the client side
        const filteredLowStock = allLowStock.filter(p => p.productType !== 'Servicios');
        setLowStockProducts(filteredLowStock);
        setLoading(false);
    }, (error) => {
      console.error("Error en listener de bajo stock:", error);
      setLoading(false);
    });

    // Expiring products listener
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + EXPIRATION_DAYS_THRESHOLD);
    const thresholdTimestamp = Timestamp.fromDate(thresholdDate);
    const expiringQuery = query(
        collection(db, 'products'),
        where('expirationDate', '<=', thresholdTimestamp)
    );
    const unsubExpiring = onSnapshot(expiringQuery, (snapshot) => {
        setExpiringProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setLoading(false);
    }, (error) => {
      console.error("Error en listener de productos por vencer:", error);
      setLoading(false);
    });
    
    // Pending orders listener
    const pendingOrdersQuery = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubPendingOrders = onSnapshot(pendingOrdersQuery, (snapshot) => {
        setPendingOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        setLoading(false);
    }, (error) => {
      console.error("Error en listener de pedidos pendientes:", error);
      setLoading(false);
    });

    return () => {
      unsubLowStock();
      unsubExpiring();
      unsubPendingOrders();
    };
  }, []);

  const totalAlerts = lowStockProducts.length + expiringProducts.length + pendingOrders.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <CardTitle>Centro de Alertas</CardTitle>
        </div>
        <CardDescription>Atenciones prioritarias para tu negocio.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
           <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : totalAlerts === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">¡Todo en orden! No hay alertas por ahora.</p>
        ) : (
          <>
            <AlertItem
              icon={Package}
              title="Bajo Stock"
              count={lowStockProducts.length}
              linkHref="/admin/products"
              linkText="Ver inventario"
              colorClass="border-amber-500 bg-amber-500/10 text-amber-700"
            />
            <AlertItem
              icon={CalendarClock}
              title="Próximos a Vencer"
              count={expiringProducts.length}
              linkHref="/admin/products"
              linkText="Gestionar productos"
              colorClass="border-red-500 bg-red-500/10 text-red-700"
            />
            <AlertItem
              icon={ShoppingCart}
              title="Pedidos Pendientes"
              count={pendingOrders.length}
              linkHref="/admin/orders"
              linkText="Procesar pedidos"
              colorClass="border-blue-500 bg-blue-500/10 text-blue-700"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
