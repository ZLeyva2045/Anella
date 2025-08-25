// src/app/admin/payroll/certificate/[evaluationId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User, Evaluation } from '@/types/firestore';
import { RecognitionCertificate } from '@/components/admin/payroll/reports/RecognitionCertificate';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateEvaluationDocument, type GenerateDocumentOutput } from '@/ai/flows/generate-evaluation-document';
import { evaluationCriteria } from '@/components/admin/payroll/PerformanceReview';


type ReportData = {
    employee: User;
    evaluation: Evaluation;
    certificateContent: string;
}

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const evaluationId = params.evaluationId as string;
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (evaluationId) {
      const fetchReportData = async () => {
        try {
          // Fetch Evaluation
          const evalRef = doc(db, 'evaluations', evaluationId);
          const evalSnap = await getDoc(evalRef);
          if (!evalSnap.exists()) throw new Error('No se encontró la evaluación especificada.');
          const evaluation = { id: evalSnap.id, ...evalSnap.data() } as Evaluation;

          // Fetch Employee
          const userRef = doc(db, 'users', evaluation.employeeId);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) throw new Error('No se encontró al empleado asociado a esta evaluación.');
          const employee = { id: userSnap.id, ...userSnap.data() } as User;
          
          // Generate certificate content
          const scoresWithLabels = evaluationCriteria.reduce((acc, criterion) => {
              acc[criterion.label] = evaluation.scores[criterion.id] ?? 0;
              return acc;
          }, {} as Record<string, number>);

           const docInput = {
              employeeName: employee.name,
              period: evaluation.period,
              scores: scoresWithLabels,
              totalScore: evaluation.totalScore,
              bonus: evaluation.bonus,
              comments: evaluation.comments,
              documentType: 'recognition' as const
          };

          const result = await generateEvaluationDocument(docInput);

          setData({ evaluation, employee, certificateContent: result.content });

        } catch (err: any) {
          setError(err.message || 'Ocurrió un error al cargar los datos del reporte.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchReportData();
    }
  }, [evaluationId]);
  
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
    <div className="bg-gray-200 min-h-screen flex flex-col items-center justify-start p-4 sm:p-8">
        <style jsx global>{`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: #fff;
            }
            .no-print {
              display: none;
            }
            .printable-area {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
                page-break-after: always;
            }
          }
          @page {
            size: A4;
            margin: 0;
          }
        `}</style>
      
      <div className="w-full max-w-4xl mb-8 no-print flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a RR.HH.
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir o Guardar como PDF
        </Button>
      </div>

       <div className="printable-area bg-white shadow-lg">
        {data && <RecognitionCertificate employee={data.employee} evaluation={data.evaluation} certificateContent={data.certificateContent} />}
       </div>

    </div>
  );
}
