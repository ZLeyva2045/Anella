// src/components/admin/analytics/TopCustomersList.tsx
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Order, User } from '@/types/firestore';
import { useMemo } from 'react';

export function TopCustomersList({ orders, users }: { orders: Order[], users: User[] }) {

  const topCustomers = useMemo(() => {
    const customerSpending: { [key: string]: number } = {};
    
    orders.forEach(order => {
        if (!customerSpending[order.userId]) {
            customerSpending[order.userId] = 0;
        }
        customerSpending[order.userId] += order.totalAmount;
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return Object.entries(customerSpending)
      .map(([userId, totalSpent]) => ({
        user: userMap.get(userId),
        totalSpent,
      }))
      .filter(item => item.user) // Filter out cases where user might not be found
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

  }, [orders, users]);
  
  if (topCustomers.length === 0) {
      return (
          <Card>
            <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Clientes que más han comprado.</CardDescription>
            </CardHeader>
            <CardContent className="h-full flex items-center justify-center">
                 <p className="text-muted-foreground text-center">No hay datos suficientes para mostrar el top de clientes.</p>
            </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clientes</CardTitle>
        <CardDescription>Clientes que más han comprado en el último trimestre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCustomers.map((customerData) => {
            const customer = customerData.user;
            if(!customer) return null;
            return (
              <div key={customer.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={customer.photoURL} alt={customer.name} />
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <div className="ml-auto font-medium text-primary">S/{customerData.totalSpent.toFixed(2)}</div>
              </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
