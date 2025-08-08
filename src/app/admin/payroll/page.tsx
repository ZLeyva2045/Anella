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
import { FeedbackManager } from '@/components/admin/payroll/FeedbackManager';
import { ReportGenerator } from '@/components/admin/payroll/reports/ReportGenerator';
import { LeaveRequestForm } from '@/components/admin/payroll/LeaveRequestForm';
import { LeaveManagement } from '@/components/admin/payroll/LeaveManagement';
import { useAuth } from '@/hooks/useAuth';


export default function PayrollPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const { firestoreUser } = useAuth();
  const isAdmin = firestoreUser?.role === 'manager';

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="retroalimentacion">Retroalimentación</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="asistencias">
          <AttendanceTracker />
        </TabsContent>

        <TabsContent value="evaluaciones">
          <PerformanceReview employees={employees} />
        </TabsContent>

        <TabsContent value="retroalimentacion">
          <FeedbackManager employees={employees} />
        </TabsContent>

        <TabsContent value="permisos">
            <LeaveManagement />
        </TabsContent>

        <TabsContent value="reportes">
          <ReportGenerator employees={employees} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
