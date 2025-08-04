// src/app/admin/employees/[id]/card/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/types/firestore';
import { EmployeeIdCard } from '@/components/admin/EmployeeIdCard';
import { Button } from '@/components/ui/button';
import { Loader2, Printer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EmployeeCardPage() {
  const params = useParams();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId) {
      const fetchEmployee = async () => {
        try {
          const docRef = doc(db, 'users', employeeId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEmployee({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            setError('No se encontró al empleado con este ID.');
          }
        } catch (err) {
          setError('Ocurrió un error al cargar los datos del empleado.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [employeeId]);
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
        <style jsx global>{`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
          @page {
            size: 8.5cm 5.5cm;
            margin: 0;
          }
        `}</style>
      
      {employee && <EmployeeIdCard employee={employee} />}

      <div className="mt-8 no-print">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir o Guardar como PDF
        </Button>
      </div>
    </div>
  );
}
