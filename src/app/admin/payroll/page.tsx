// src/app/admin/payroll/page.tsx
'use client';

import React from 'react';
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
import { ClipboardList, PlusCircle } from 'lucide-react';

export default function PayrollPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de RR.HH. y Nómina</h1>
          <p className="text-muted-foreground">
            Administra empleados, asistencias, evaluaciones y genera reportes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Empleado
          </Button>
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
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Módulo de Evaluaciones en desarrollo.
              </p>
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
