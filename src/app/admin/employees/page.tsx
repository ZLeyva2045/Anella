// src/app/admin/employees/page.tsx
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
  Trash2,
  UserCog,
  Loader2,
  Badge,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types/firestore';
import { EmployeeForm } from '@/components/admin/EmployeeForm';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { deleteEmployee } from '@/services/employeeService';
import { Badge as BadgeUI } from '@/components/ui/badge';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const employeeRoles = ['manager', 'sales', 'designer', 'manufacturing', 'creative'];
    const employeesQuery = query(usersCollection, where('role', 'in', employeeRoles));
    
    const unsubscribe = onSnapshot(employeesQuery, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setEmployees(employeesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching employees: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los empleados.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };
  
  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este empleado? Esta acción no se puede deshacer y eliminará su cuenta de acceso.')) {
      return;
    }
    try {
      await deleteEmployee(employeeId);
      toast({ title: "Empleado eliminado", description: "El empleado ha sido eliminado correctamente." });
    } catch (error: any) {
      console.error("Error deleting employee: ", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo eliminar el empleado." });
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
            <p className="text-muted-foreground">
              Añade, elimina y gestiona los carnets del personal.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddEmployee}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Empleado
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal de Anella</CardTitle>
            <CardDescription>
              Un listado completo de los miembros del equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Rol</TableHead>
                    <TableHead className="hidden md:table-cell">Correo</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarImage src={employee.photoURL} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <span className="font-medium">{employee.name}</span>
                            <span className="text-muted-foreground text-xs capitalize md:hidden">{employee.role}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <BadgeUI variant="outline" className="capitalize">{employee.role}</BadgeUI>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {employee.email}
                      </TableCell>
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
                                <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                 <DropdownMenuItem>
                                  <Badge className="mr-2 h-4 w-4" />
                                  Generar Carnet
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteEmployee(employee.id)}>
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
            )}
          </CardContent>
        </Card>
      </div>

      <EmployeeForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        employee={selectedEmployee}
      />
    </>
  );
}
