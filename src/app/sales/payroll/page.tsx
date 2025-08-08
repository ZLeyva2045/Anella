// src/app/sales/payroll/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { LeaveRequestForm } from '@/components/admin/payroll/LeaveRequestForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import type { LeaveRequest } from '@/types/firestore';
import { Loader2, MessageCircleWarning } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


function LeaveHistory() {
  const { firestoreUser } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!firestoreUser) return;
    setLoading(true);
    const q = query(
      collection(db, 'leaveRequests'), 
      where('employeeId', '==', firestoreUser.id),
      orderBy('requestDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestoreUser]);
  
  const getStatusVariant = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      case 'pending': default: return 'outline';
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Mi Historial de Permisos</CardTitle>
          <CardDescription>Consulta el estado de todas tus solicitudes.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Solicitada</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">No tienes solicitudes.</TableCell></TableRow>
                ) : (
                  requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>{format(req.leaveDate.toDate(), "P", { locale: es })}</TableCell>
                      <TableCell className="capitalize">{req.shift}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Badge variant={getStatusVariant(req.status)} className="capitalize">{req.status}</Badge>
                           {req.status === 'rejected' && req.rejectionReason && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <MessageCircleWarning className="h-4 w-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Motivo del rechazo: {req.rejectionReason}</p>
                                </TooltipContent>
                              </Tooltip>
                           )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default function SalesPayrollPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Mis Permisos</h1>
        <p className="text-muted-foreground">
          Usa esta sección para solicitar permisos, justificar ausencias y ver tu historial.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LeaveRequestForm />
        <LeaveHistory />
      </div>
    </div>
  );
}
