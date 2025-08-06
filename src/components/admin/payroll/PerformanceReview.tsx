// src/components/admin/payroll/PerformanceReview.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, User, Calendar, Wand } from 'lucide-react';
import type { User } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { saveEvaluation } from '@/services/payrollService';
import { useAuth } from '@/hooks/useAuth';

const evaluationCriteria = [
  { id: 'punctuality', label: 'Puntualidad', description: 'Asistencia y llegada a tiempo, apertura del local.', maxScore: 2.5 },
  { id: 'attitude', label: 'Actitud', description: 'Disposición, respeto, empatía y forma de tratar a compañeras y clientes.', maxScore: 2.5 },
  { id: 'teamwork', label: 'Trabajo en Equipo', description: 'Cómo se relaciona con las demás, disposición a colaborar y resolver en conjunto.', maxScore: 2.5 },
  { id: 'supportDisposition', label: 'Disposición a Apoyar', description: 'Participación voluntaria en horas extras, tareas adicionales o apoyo fuera de su rol.', maxScore: 2.5 },
  { id: 'marketingProactivity', label: 'Proactividad en Marketing', description: 'Participación en ideas, contenido, lives u otras acciones que ayuden a visibilizar Anella.', maxScore: 2.5 },
  { id: 'cleanliness', label: 'Limpieza y Orden', description: 'Mantenimiento del espacio de trabajo limpio, ordenado y funcional.', maxScore: 2.5 },
  { id: 'personalPresentation', label: 'Presentación Personal', description: 'Uso correcto del uniforme, aseo y cuidado personal.', maxScore: 2.5 },
  { id: 'responsibility', label: 'Responsabilidad y Manejo de Errores', description: 'Reconocimiento y comunicación de errores. Disposición a asumirlos y corregir.', maxScore: 2.5 },
];

const bonusScale: { [score: string]: number } = {
  '12.5': 3, '13.0': 6, '13.5': 9, '14.0': 13, '14.5': 16, '15.0': 19, '15.5': 22,
  '16.0': 25, '16.5': 28, '17.0': 31, '17.5': 34, '18.0': 38, '18.5': 41, '19.0': 44, '19.5': 47, '20.0': 50,
};

const evaluationSchema = z.object({
  employeeId: z.string().min(1, 'Debes seleccionar un empleado.'),
  period: z.string().min(1, 'Debes seleccionar un período.'),
  scores: z.record(z.number()),
  comments: z.string().optional(),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface PerformanceReviewProps {
  employees: User[];
}

export function PerformanceReview({ employees }: PerformanceReviewProps) {
  const [loading, setLoading] = useState(false);
  const { user: evaluator } = useAuth();
  const { toast } = useToast();

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      employeeId: '',
      period: `${new Date().toLocaleString('es-PE', { month: 'long' })} ${new Date().getFullYear()}`.replace(/^\w/, c => c.toUpperCase()),
      scores: evaluationCriteria.reduce((acc, crit) => ({ ...acc, [crit.id]: 0 }), {}),
      comments: '',
    },
  });

  const scores = useWatch({ control: form.control, name: 'scores' });

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  }, [scores]);

  const bonusAmount = useMemo(() => {
    const scoreKey = totalScore.toFixed(1);
    if (totalScore < 12.5) return 0;
    return bonusScale[scoreKey] || (bonusScale[Math.floor(totalScore * 2) / 2 .toFixed(1)] ?? 0);
  }, [totalScore]);

  const onSubmit = async (data: EvaluationFormValues) => {
    if (!evaluator) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo identificar al evaluador.'});
      return;
    }
    setLoading(true);
    try {
        await saveEvaluation({
            employeeId: data.employeeId,
            evaluatorId: evaluator.uid,
            period: data.period,
            scores: data.scores,
            comments: data.comments,
            totalScore: totalScore,
            bonus: bonusAmount,
            createdAt: new Date(),
        });
        toast({ title: 'Evaluación Guardada', description: 'La evaluación de desempeño ha sido registrada correctamente.'});
        form.reset();
    } catch (error: any) {
        console.error('Error saving evaluation: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la evaluación.'});
    } finally {
        setLoading(false);
    }
  };

  const selectedEmployeeId = useWatch({ control: form.control, name: 'employeeId' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluaciones de Desempeño Mensual</CardTitle>
        <CardDescription>Realiza evaluaciones basadas en la rúbrica de Anella para calcular bonos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="employeeId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><User />Empleado a Evaluar</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger></FormControl>
                    <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField name="period" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Calendar />Período de Evaluación</FormLabel>
                  <FormControl><Input {...field} /></FormControl><FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />
            
            {!selectedEmployeeId ? (
                <div className="text-center text-muted-foreground py-10">Por favor, selecciona un empleado para comenzar.</div>
            ) : (
                <div className="space-y-6">
                {evaluationCriteria.map(criterion => (
                  <FormField key={criterion.id} name={`scores.${criterion.id}`} control={form.control} render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                         <div>
                            <FormLabel className="text-base">{criterion.label}</FormLabel>
                            <p className="text-xs text-muted-foreground">{criterion.description}</p>
                         </div>
                         <span className="font-bold text-lg text-primary w-20 text-center">{field.value.toFixed(1)} / {criterion.maxScore}</span>
                      </div>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={criterion.maxScore}
                          step={0.5}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                ))}

                <Separator />

                <FormField name="comments" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Comentarios Adicionales</FormLabel>
                        <FormControl><Textarea placeholder="Añade observaciones, fortalezas o áreas de mejora específicas..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                 <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Resultado Final de la Evaluación</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-around text-center">
                        <div>
                            <p className="text-muted-foreground">Puntaje Total</p>
                            <p className="text-3xl font-bold text-foreground">{totalScore.toFixed(1)} / 20</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Bono Ganado</p>
                            <p className="text-3xl font-bold text-primary">S/ {bonusAmount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                    Guardar Evaluación
                  </Button>
                </div>
              </div>
            )}

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
