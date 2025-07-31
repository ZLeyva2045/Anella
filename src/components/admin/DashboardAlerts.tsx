// src/components/admin/DashboardAlerts.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, CalendarClock, ShoppingCart, Loader2, Sparkles } from 'lucide-react';
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
    <div className={`flex items-center gap-4`}>
      <div className={`p-2 rounded-full ${colorClass}`}>
         <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{count} {title}</p>
        <Button variant="link" asChild className="p-0 h-auto text-xs text-muted-foreground">
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
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let active = true;
    const loadAlerts = async () => {
        const lowStockQuery = query(
            collection(db, 'products'),
            where('stock', '<=', LOW_STOCK_THRESHOLD)
        );
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + EXPIRATION_DAYS_THRESHOLD);
        const thresholdTimestamp = Timestamp.fromDate(thresholdDate);
        const expiringQuery = query(
            collection(db, 'lotes'),
            where('fechaVencimiento', '<=', thresholdTimestamp),
            where('estadoLote', '==', 'activo')
        );
        const pendingOrdersQuery = query(collection(db, 'orders'), where('fulfillmentStatus', '==', 'pending'));
        const inProgressOrdersQuery = query(collection(db, 'orders'), where('fulfillmentStatus', 'in', ['processing', 'finishing']));

        const unsubLowStock = onSnapshot(lowStockQuery, (snapshot) => {
            if (!active) return;
            const filteredLowStock = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)).filter(p => p.productType !== 'Servicios');
            setLowStockProducts(filteredLowStock);
        });

        const unsubExpiring = onSnapshot(expiringQuery, (snapshot) => {
            if (!active) return;
            setExpiringProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        });

        const unsubPending = onSnapshot(pendingOrdersQuery, (snapshot) => {
            if (!active) return;
            setPendingOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        });
        
        const unsubInProgress = onSnapshot(inProgressOrdersQuery, (snapshot) => {
            if (!active) return;
            setInProgressOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        });

        // This is a simple way to set loading to false after initial load
        setTimeout(() => { if(active) setLoading(false) }, 1500);

        return () => {
            active = false;
            unsubLowStock();
            unsubExpiring();
            unsubPending();
            unsubInProgress();
        };
    }

    loadAlerts();

  }, []);
  
  const totalAlerts = lowStockProducts.length + expiringProducts.length + pendingOrders.length + inProgressOrders.length;


  if (loading) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-center h-full">
        <div className="flex items-center gap-3 mb-4">
             <div className="p-3 rounded-full bg-amber-100 text-amber-500">
                <AlertTriangle className="h-7 w-7" />
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
             </div>
        </div>
        <div className="space-y-3">
             <AlertItem
              icon={ShoppingCart}
              title="Pedidos Pendientes"
              count={pendingOrders.length}
              linkHref="/admin/orders"
              linkText="Procesar"
              colorClass="bg-blue-100 text-blue-600"
            />
             <AlertItem
              icon={Sparkles}
              title="Pedidos en Curso"
              count={inProgressOrders.length}
              linkHref="/admin/orders"
              linkText="Ver en curso"
              colorClass="bg-purple-100 text-purple-600"
            />
            <AlertItem
              icon={Package}
              title="Bajo Stock"
              count={lowStockProducts.length}
              linkHref="/admin/products"
              linkText="Revisar"
              colorClass="bg-amber-100 text-amber-600"
            />
            <AlertItem
              icon={CalendarClock}
              title="Próximos a Vencer"
              count={expiringProducts.length}
              linkHref="/admin/compras"
              linkText="Ver lotes"
              colorClass="bg-red-100 text-red-600"
            />
        </div>
        {totalAlerts === 0 && (
             <p className="text-center text-sm text-muted-foreground pt-4">¡Todo en orden!</p>
        )}
    </div>
  );
}
