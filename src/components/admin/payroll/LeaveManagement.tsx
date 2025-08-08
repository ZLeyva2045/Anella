// src/components/admin/payroll/LeaveManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase/config';
import type { LeaveRequest } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, Check, X, FileImage, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { updateLeaveRequestStatus } from '@/services/leaveService';
import { useToast } from '@/hooks/use-toast';

export function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestoreUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'leaveRequests'), orderBy('requestDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!firestoreUser) return;
    try {
      await updateLeaveRequestStatus(requestId, status, firestoreUser.id);
      toast({ title: 'Solicitud Actualizada', description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getStatusVariant = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      case 'pending':
      default: return 'outline';
    }
  };
  
   const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 border-green-200 bg-green-50';
      case 'rejected': return 'text-red-600 border-red-200 bg-red-50';
      case 'pending':
      default: return '';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Permisos</CardTitle>
        <CardDescription>Revisa, aprueba o rechaza las solicitudes de permiso del personal.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha Solicitada</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Justificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No hay solicitudes de permiso.</TableCell></TableRow>
              ) : (
                requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.employeeName}</TableCell>
                    <TableCell>{format(req.leaveDate.toDate(), 'P', { locale: es })}</TableCell>
                    <TableCell className="capitalize">{req.shift === 'full-day' ? 'Día Completo' : req.shift}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.justification}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(req.status)} className={cn('capitalize', getStatusColor(req.status))}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {req.attachmentUrl && (
                                <DropdownMenuItem asChild>
                                    <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" /> Ver Adjunto
                                    </a>
                                </DropdownMenuItem>
                            )}
                            {req.status === 'pending' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'approved')} className="text-green-600 focus:text-green-700">
                                        <Check className="mr-2 h-4 w-4" /> Aprobar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'rejected')} className="text-destructive focus:text-destructive">
                                        <X className="mr-2 h-4 w-4" /> Rechazar
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
