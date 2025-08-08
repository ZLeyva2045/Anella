// src/app/sales/payroll/page.tsx
'use client';

import React from 'react';
import { LeaveRequestForm } from '@/components/admin/payroll/LeaveRequestForm';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesPayrollPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold">Mis Permisos</h1>
        <p className="text-muted-foreground">
          Usa esta sección para solicitar permisos o justificar ausencias.
        </p>
      </div>
      <LeaveRequestForm />
    </div>
  );
}
