// src/app/admin/analytics/page.tsx
'use client';
import { ProfitByProductChart } from "@/components/admin/analytics/ProfitByProductChart";
import { SellerPerformanceChart } from "@/components/admin/analytics/SellerPerformanceChart";
import { TopCustomersList } from "@/components/admin/analytics/TopCustomersList";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect, useState } from 'react';
import type { Order, User } from '@/types/firestore';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const ordersQuery = query(collection(db, 'orders'), where('fulfillmentStatus', '==', 'completed'));
                const usersQuery = query(collection(db, 'users'));
                
                const [ordersSnapshot, usersSnapshot] = await Promise.all([
                    getDocs(ordersQuery),
                    getDocs(usersQuery)
                ]);

                setOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
                setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análisis y Estrategia</h1>
        <p className="text-gray-500 mt-1">
          Análisis profundos para optimizar tu negocio y tomar decisiones informadas.
        </p>
      </div>
      
       {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                <ProfitByProductChart orders={orders} />
                </div>
                <div>
                <TopCustomersList orders={orders} users={users} />
                </div>
            </div>

            <div>
                <SellerPerformanceChart orders={orders} users={users} />
            </div>
        </>
      )}
    </div>
  );
}
