// src/app/admin/customers/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/firestore';
import { CustomerForm } from '@/components/shared/CustomerForm';
// En una implementación real, se obtendrían de Firestore
// import { collection, onSnapshot, query, where } from 'firebase/firestore';
// import { db } from '@/lib/firebase/config';

// Datos de ejemplo
const mockCustomers: (User & { joined: Date, totalSpent: number, totalOrders: number })[] = [
  { id: 'usr1', name: 'Liam Johnson', email: 'liam@test.com', phone: '', address: '', orders: [], role: 'customer', photoURL: 'https://i.ibb.co/L8vT5s5/avatar-1.png', joined: new Date('2023-10-15'), totalSpent: 1250.50, totalOrders: 5, loyaltyPoints: 125 },
  { id: 'usr2', name: 'Olivia Smith', email: 'olivia@test.com', phone: '', address: '', orders: [], role: 'customer', photoURL: 'https://i.ibb.co/JqgV1D5/avatar-2.png', joined: new Date('2023-10-20'), totalSpent: 850.75, totalOrders: 3, loyaltyPoints: 85 },
  { id: 'usr3', name: 'Noah Williams', email: 'noah@test.com', phone: '', address: '', orders: [], role: 'customer', photoURL: 'https://i.ibb.co/vYd9d9B/avatar-3.png', joined: new Date('2023-11-01'), totalSpent: 2350.00, totalOrders: 8, loyaltyPoints: 235 },
  { id: 'usr4', name: 'Emma Brown', email: 'emma@test.com', phone: '', address: '', orders: [], role: 'customer', photoURL: 'https://i.ibb.co/d2cfM2R/avatar-4.png', joined: new Date('2023-11-05'), totalSpent: 450.00, totalOrders: 2, loyaltyPoints: 45 },
  { id: 'usr5', name: 'Ava Jones', email: 'ava@test.com', phone: '', address: '', orders: [], role: 'customer', photoURL: 'https://i.ibb.co/Fny8g1F/avatar-5.png', joined: new Date('2023-11-12'), totalSpent: 155.00, totalOrders: 1, loyaltyPoints: 15 },
];


export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>(mockCustomers);
  const [loading, setLoading] = useState(false); // Cambiar a true al usar Firestore
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // Lógica de Firestore (descomentar para usar)
  /*
  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const customersQuery = query(usersCollection, where('role', '==', 'customer'));
    
    const unsubscribe = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      // Aquí podrías calcular totalSpent y totalOrders para cada cliente
      setCustomers(customersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  */
  
  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };
  
  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes y Fidelización</h1>
            <p className="text-muted-foreground">
              Gestiona la cartera de clientes y sus puntos de fidelidad.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddCustomer}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cliente
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todos los Clientes</CardTitle>
            <CardDescription>
              Un listado completo de los clientes y su actividad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Puntos</TableHead>
                  <TableHead className="hidden md:table-cell">Total Pedidos</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Total Gastado</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={customer.photoURL} alt={customer.name} />
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-muted-foreground text-xs">{customer.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">{customer.loyaltyPoints || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">S/{customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                          <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CustomerForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        customer={selectedCustomer}
      />
    </>
  );
}
