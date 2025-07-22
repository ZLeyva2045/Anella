// src/components/admin/analytics/TopCustomersList.tsx
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Datos de ejemplo
const topCustomers = [
  { name: 'Elena Rodríguez', email: 'elena.r@example.com', totalSpent: 1250.75, avatar: '/avatars/01.png' },
  { name: 'Marcos Pérez', email: 'marcos.p@example.com', totalSpent: 980.50, avatar: '/avatars/02.png' },
  { name: 'Lucía Gómez', email: 'lucia.g@example.com', totalSpent: 850.00, avatar: '/avatars/03.png' },
  { name: 'Javier Fernández', email: 'javier.f@example.com', totalSpent: 720.20, avatar: '/avatars/04.png' },
  { name: 'Sofía Díaz', email: 'sofia.d@example.com', totalSpent: 650.00, avatar: '/avatars/05.png' },
];

export function TopCustomersList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clientes</CardTitle>
        <CardDescription>Clientes que más han comprado en el último trimestre.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topCustomers.map((customer, index) => (
          <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
            <div className="ml-auto font-medium text-primary">S/{customer.totalSpent.toFixed(2)}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
