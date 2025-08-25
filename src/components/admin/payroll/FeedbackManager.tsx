// src/components/admin/payroll/FeedbackManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { User, Feedback, Evaluation } from '@/types/firestore';
import { saveFeedback, getEvaluations } from '@/services/payrollService';
import { Loader2, Save, MessageSquarePlus, ThumbsUp, Goal, User as UserIcon, Wand2, Award } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateFeedbackComment, type GenerateFeedbackCommentInput } from '@/ai/flows/generate-feedback-comment';
import { evaluationCriteria } from './PerformanceReview';


const feedbackSchema = z.object({
  employeeId: z.string().min(1, 'Debes seleccionar un empleado.'),
  evaluationId: z.string().optional(),
  type: z.enum(['recognition', 'improvement'], { required_error: 'Debes seleccionar un tipo de feedback.' }),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres.'),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackManagerProps {
  employees: User[];
}

export function FeedbackManager({ employees }: FeedbackManagerProps) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [latestEvaluation, setLatestEvaluation] = useState<Evaluation | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const { user: evaluator } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { employeeId: '', evaluationId: '', type: 'recognition', comment: '' },
  });
  
  const feedbackType = form.watch('type');

  useEffect(() => {
    const fetchLatestEvaluation = async (employeeId: string) => {
        try {
            const evals = await getEvaluations(employeeId);
            if (evals.length > 0) {
                setLatestEvaluation(evals[0]);
                form.setValue('evaluationId', evals[0].id);
            } else {
                setLatestEvaluation(null);
                 form.setValue('evaluationId', undefined);
            }
        } catch (error) {
            console.error(error);
            setLatestEvaluation(null);
        }
    }

    if (selectedEmployeeId) {
      setLoadingHistory(true);
      fetchLatestEvaluation(selectedEmployeeId);
      const q = query(
        collection(db, 'feedback'),
        where('employeeId', '==', selectedEmployeeId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setFeedbackHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
        setLoadingHistory(false);
      });
      return () => unsubscribe();
    } else {
        setFeedbackHistory([]);
        setLatestEvaluation(null);
    }
  }, [selectedEmployeeId, form]);

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!evaluator) return;
    setLoading(true);
    try {
      await saveFeedback({
        ...data,
        evaluatorId: evaluator.uid,
        period: `${new Date().toLocaleString('es-PE', { month: 'long' })} ${new Date().getFullYear()}`.replace(/^\w/, c => c.toUpperCase()),
        createdAt: new Date(),
      });
      toast({ title: 'Feedback Guardado', description: 'La retroalimentación ha sido registrada.' });
      form.reset({ employeeId: data.employeeId, type: 'recognition', comment: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el feedback.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateComment = async () => {
      if (!latestEvaluation) {
          toast({ variant: 'destructive', title: 'Sin evaluación', description: 'No se encontró una evaluación reciente para este empleado.' });
          return;
      }
      setIsGenerating(true);
      try {
          const scoresWithLabels = evaluationCriteria.reduce((acc, criterion) => {
              acc[criterion.label] = latestEvaluation.scores[criterion.id] ?? 0;
              return acc;
          }, {} as Record<string, number>);

          const input: GenerateFeedbackCommentInput = {
              employeeName: employees.find(e => e.id === latestEvaluation.employeeId)?.name || 'Empleado',
              scores: scoresWithLabels,
              totalScore: latestEvaluation.totalScore,
              evaluatorComments: latestEvaluation.comments,
              feedbackType: feedbackType,
          };
          const result = await generateFeedbackComment(input);
          form.setValue('comment', result.comment, { shouldValidate: true });
          
      } catch (error) {
           toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar el comentario.' });
      } finally {
          setIsGenerating(false);
      }
  }

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    form.setValue('employeeId', employeeId);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquarePlus /> Registrar Nueva Retroalimentación</CardTitle>
          <CardDescription>Proporciona feedback constructivo para el crecimiento del personal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="employeeId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <Select onValueChange={handleEmployeeChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger></FormControl>
                    <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {selectedEmployeeId && (
                <>
                  <FormField name="type" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Feedback</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="recognition">Reconocimiento</SelectItem>
                          <SelectItem value="improvement">Área de Mejora</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="comment" control={form.control} render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Comentario Detallado</FormLabel>
                        <Button type="button" variant="ghost" size="sm" onClick={handleGenerateComment} disabled={!latestEvaluation || isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                            Generar con IA
                        </Button>
                      </div>
                      <FormControl><Textarea placeholder="Describe el comportamiento o situación específica..." {...field} rows={5} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                      Guardar Feedback
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Retroalimentación</CardTitle>
          <CardDescription>
            {selectedEmployeeId ? `Mostrando historial para ${employees.find(e => e.id === selectedEmployeeId)?.name}` : 'Selecciona un empleado para ver su historial.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
          {loadingHistory ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div>
          ) : feedbackHistory.length === 0 ? (
            <p className="text-center text-muted-foreground pt-10">
              {selectedEmployeeId ? 'Este empleado aún no tiene retroalimentación.' : 'Selecciona un empleado para empezar.'}
            </p>
          ) : (
            feedbackHistory.map(fb => (
              <div key={fb.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                   <Badge variant={fb.type === 'recognition' ? 'secondary' : 'destructive'} className={cn(fb.type === 'recognition' && "text-green-600 border-green-200 bg-green-50")}>
                      {fb.type === 'recognition' ? <ThumbsUp className="mr-2 h-3 w-3"/> : <Goal className="mr-2 h-3 w-3"/>}
                      {fb.type === 'recognition' ? 'Reconocimiento' : 'Área de Mejora'}
                   </Badge>
                  <p className="text-xs text-muted-foreground">{format(fb.createdAt.toDate(), "P", { locale: es })}</p>
                </div>
                <p className="text-sm">{fb.comment}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><UserIcon className="h-3 w-3"/>Evaluador: {employees.find(e => e.id === fb.evaluatorId)?.name || 'Desconocido'}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
