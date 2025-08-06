// src/app/admin/payroll/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ClipboardList, PlusCircle, Save } from 'lucide-react';
import type { User } from '@/types/firestore';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AttendanceTracker } from '@/components/admin/payroll/AttendanceTracker';
import { PerformanceReview } from '@/components/admin/payroll/PerformanceReview';


export default function PayrollPage() {
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    const employeeRoles = ['manager', 'sales', 'designer', 'manufacturing', 'creative'];
    const employeesQuery = query(collection(db, 'users'), where('role', 'in', employeeRoles));
    
    const unsubscribe = onSnapshot(employeesQuery, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de RR.HH. y Nómina</h1>
          <p className="text-muted-foreground">
            Controla asistencias, gestiona evaluaciones y genera reportes de desempeño para el personal.
          </p>
        </div>
      </div>

      <Tabs defaultValue="asistencias" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="retroalimentacion">Retroalimentación</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="asistencias">
          <AttendanceTracker />
        </TabsContent>

        <TabsContent value="evaluaciones">
          <PerformanceReview employees={employees} />
        </TabsContent>

        <TabsContent value="retroalimentacion">
          <Card>
            <CardHeader>
              <CardTitle>Retroalimentación y Críticas Constructivas</CardTitle>
              <CardDescription>
                Proporciona feedback detallado para el crecimiento profesional.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Módulo de Retroalimentación en desarrollo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reportes">
          <Card>
            <CardHeader>
              <CardTitle>Generación de Reportes</CardTitle>
              <CardDescription>
                Autogenera reportes de desempeño individuales.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Generador de Reportes en desarrollo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
