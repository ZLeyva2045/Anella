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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const evaluationCriteria = [
  { id: 'quality', label: 'Calidad del Trabajo' },
  { id: 'punctuality', label: 'Puntualidad y Asistencia' },
  { id: 'teamwork', label: 'Trabajo en Equipo' },
  { id: 'initiative', label: 'Iniciativa y Proactividad' },
  { id: 'customerService', label: 'Atención al Cliente' },
];

const ratingLevels = [
  { id: '1', label: 'Necesita Mejora' },
  { id: '2', label: 'Cumple Expectativas' },
  { id: '3', label: 'Supera Expectativas' },
  { id: '4', label: 'Excepcional' },
];

export default function PayrollPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const { toast } = useToast();

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

      <Tabs defaultValue="evaluaciones" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="asistencias">Asistencias</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="retroalimentacion">Retroalimentación</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="asistencias">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencias</CardTitle>
              <CardDescription>
                Registra y visualiza la asistencia de los empleados.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Funcionalidad de Asistencias en desarrollo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluaciones">
          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones de Desempeño</CardTitle>
              <CardDescription>
                Realiza evaluaciones basadas en rúbricas personalizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger className="w-full md:w-1/3">
                    <SelectValue placeholder="Selecciona un empleado a evaluar" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Separator />

                {selectedEmployeeId ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Rúbrica de Evaluación</h3>
                    <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Criterio</TableHead>
                              {ratingLevels.map(level => <TableHead key={level.id} className="text-center">{level.label}</TableHead>)}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {evaluationCriteria.map(criterion => (
                              <TableRow key={criterion.id}>
                                <TableCell className="font-medium">{criterion.label}</TableCell>
                                <TableCell colSpan={ratingLevels.length}>
                                  <RadioGroup className="flex justify-around">
                                    {ratingLevels.map(level => (
                                      <div key={level.id} className="flex items-center justify-center w-full">
                                        <RadioGroupItem value={`${criterion.id}-${level.id}`} id={`${criterion.id}-${level.id}`} />
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comments">Comentarios Adicionales</Label>
                        <Textarea id="comments" placeholder="Añade observaciones, fortalezas o áreas de mejora específicas..."/>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>
                          <Save className="mr-2 h-4 w-4"/>
                          Guardar Evaluación
                      </Button>
                    </div>
                  </div>
                ) : (
                   <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <p>Por favor, selecciona un empleado para comenzar la evaluación.</p>
                   </div>
                )}

            </CardContent>
          </Card>
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
