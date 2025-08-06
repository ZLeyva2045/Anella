// src/components/admin/payroll/reports/PerformanceSummary.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Evaluation } from '@/types/firestore';

const evaluationCriteriaLabels: { [key: string]: string } = {
  punctuality: 'Puntualidad',
  attitude: 'Actitud',
  teamwork: 'Trabajo en Equipo',
  supportDisposition: 'Disposición',
  marketingProactivity: 'Marketing',
  cleanliness: 'Limpieza',
  personalPresentation: 'Presentación',
  responsibility: 'Responsabilidad',
};

interface PerformanceSummaryProps {
  evaluation: Evaluation;
}

export function PerformanceSummary({ evaluation }: PerformanceSummaryProps) {
  const chartData = Object.entries(evaluation.scores).map(([key, value]) => ({
    subject: evaluationCriteriaLabels[key] || key,
    score: value,
    fullMark: 2.5,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Evaluación de Desempeño</CardTitle>
        <CardDescription>Puntuación general y desglose por criterio.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-muted-foreground">Puntaje Total</p>
            <p className="text-5xl font-bold text-foreground">{evaluation.totalScore.toFixed(1)} / 20</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Bono Ganado</p>
            <p className="text-5xl font-bold text-primary">S/ {evaluation.bonus.toFixed(2)}</p>
          </div>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="Puntaje" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
              <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
