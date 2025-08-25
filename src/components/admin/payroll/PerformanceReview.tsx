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
import { Loader2, Save, User, Calendar, Wand2, PlusCircle, AlertCircle, FileText, Bot } from 'lucide-react';
import type { User, Evaluation } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { saveEvaluation, getEvaluations } from '@/services/payrollService';
import { useAuth } from '@/hooks/useAuth';
import { EvaluationHistory } from './EvaluationHistory';
import { generateEvaluationDocument, type GenerateDocumentOutput } from '@/ai/flows/generate-evaluation-document';
import { EvaluationDocumentViewer } from './EvaluationDocumentViewer';
import { useRouter } from 'next/navigation';


export const evaluationCriteria = [
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
  id: z.string().optional(),
  employeeId: z.string().min(1, 'Debes seleccionar un empleado.'),
  period: z.string().min(1, 'Debes seleccionar un período.'),
  scores: z.record(z.number()),
  comments: z.string().optional(),
  createdAt: z.date().optional(),
});

export type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface PerformanceReviewProps {
  employees: User[];
}

export function PerformanceReview({ employees }: PerformanceReviewProps) {
  const [loading, setLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [evaluationExists, setEvaluationExists] = useState(false);
  const [checkingEvaluation, setCheckingEvaluation] = useState(false);
  const router = useRouter();
  
  // AI Document Generation State
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GenerateDocumentOutput | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  
  const { user: evaluator } = useAuth();
  const { toast } = useToast();

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      id: undefined,
      employeeId: '',
      period: `${new Date().toLocaleString('es-PE', { month: 'long' })} ${new Date().getFullYear()}`.replace(/^\w/, c => c.toUpperCase()),
      scores: evaluationCriteria.reduce((acc, crit) => ({ ...acc, [crit.id]: 0 }), {}),
      comments: '',
      createdAt: new Date(),
    },
  });
  
  const selectedEmployeeId = useWatch({ control: form.control, name: 'employeeId' });
  const period = useWatch({ control: form.control, name: 'period' });

  useEffect(() => {
    if (selectedEvaluation) {
      form.reset({
        ...selectedEvaluation,
        createdAt: selectedEvaluation.createdAt.toDate(),
      });
      setEvaluationExists(false); // Allow editing
    }
  }, [selectedEvaluation, form]);

  useEffect(() => {
    const checkExistingEvaluation = async () => {
        if (!selectedEmployeeId || !period || selectedEvaluation?.employeeId === selectedEmployeeId) {
            setEvaluationExists(false);
            return;
        }

        setCheckingEvaluation(true);
        try {
            const existingEvaluations = await getEvaluations(selectedEmployeeId, period);
            const exists = existingEvaluations.length > 0;
            setEvaluationExists(exists);
        } catch (error) {
            console.error("Error checking for existing evaluation:", error);
            setEvaluationExists(false); // Assume it doesn't exist on error
        } finally {
            setCheckingEvaluation(false);
        }
    };
    checkExistingEvaluation();
  }, [selectedEmployeeId, period, selectedEvaluation]);
  
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
        const savedId = await saveEvaluation({
            employeeId: data.employeeId,
            evaluatorId: evaluator.uid,
            period: data.period,
            scores: data.scores,
            comments: data.comments,
            totalScore: totalScore,
            bonus: bonusAmount,
            createdAt: data.createdAt || new Date(),
        }, data.id);
        toast({ title: `Evaluación ${data.id ? 'actualizada' : 'guardada'}`, description: 'La evaluación de desempeño ha sido registrada correctamente.'});
        
        const latestEvaluation = await getEvaluations(data.employeeId, data.period);
        if (latestEvaluation.length > 0) {
            setSelectedEvaluation(latestEvaluation[0]);
        } else {
            handleNewEvaluation();
        }

    } catch (error: any) {
        console.error('Error saving evaluation: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la evaluación.'});
    } finally {
        setLoading(false);
    }
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation(null);
    form.reset({
      id: undefined,
      employeeId: '',
      period: `${new Date().toLocaleString('es-PE', { month: 'long' })} ${new Date().getFullYear()}`.replace(/^\w/, c => c.toUpperCase()),
      scores: evaluationCriteria.reduce((acc, crit) => ({ ...acc, [crit.id]: 0 }), {}),
      comments: '',
      createdAt: new Date(),
    });
  }

  const handleGenerateDocument = async (documentType: 'action_plan' | 'memorandum') => {
      const currentData = form.getValues();
      const currentTotalScore = Object.values(currentData.scores).reduce((sum, score) => sum + score, 0);
      const currentBonus = bonusScale[currentTotalScore.toFixed(1)] || 0;

      setIsGeneratingDoc(true);
      try {
          const scoresWithLabels = evaluationCriteria.reduce((acc, criterion) => {
              acc[criterion.label] = currentData.scores[criterion.id] ?? 0;
              return acc;
          }, {} as Record<string, number>);

          const input = {
              employeeName: employees.find(e => e.id === currentData.employeeId)?.name || 'Empleado',
              period: currentData.period,
              scores: scoresWithLabels,
              totalScore: currentTotalScore,
              bonus: currentBonus,
              comments: currentData.comments,
              documentType: documentType
          }
          const result = await generateEvaluationDocument(input);
          
          setGeneratedDoc(result);
          setIsDocViewerOpen(true);
          
      } catch (error) {
          console.error("Error generating document: ", error);
          toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar el documento.' });
      } finally {
          setIsGeneratingDoc(false);
      }
  }


  return (
     <>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>{selectedEvaluation ? 'Editar Evaluación' : 'Nueva Evaluación'}</CardTitle>
              <CardDescription>
                {selectedEvaluation ? `Modificando la evaluación de ${employees.find(e=>e.id === selectedEvaluation.employeeId)?.name}.` : 'Completa los campos para registrar una nueva evaluación.'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleNewEvaluation}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva
            </Button>
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
              ) : checkingEvaluation ? (
                 <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div>
              ) : evaluationExists ? (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 space-y-2 rounded-md">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5"/>
                        <h4 className="font-bold">Evaluación Existente</h4>
                    </div>
                    <p className="text-sm">
                        Este empleado ya ha sido evaluado para este período. Para hacer cambios, por favor busca la evaluación en el historial.
                    </p>
                </div>
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
                           <span className="font-bold text-lg text-primary w-20 text-center">{field.value?.toFixed(1) || '0.0'} / {criterion.maxScore}</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value || 0]}
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
                      {selectedEvaluation ? 'Actualizar' : 'Guardar'} Evaluación
                    </Button>
                  </div>

                 {selectedEvaluation && (
                     <Card>
                         <CardHeader>
                             <CardTitle className="flex items-center gap-2 text-lg"><Bot /> Asistente de RR.HH.</CardTitle>
                             <CardDescription>Genera documentos o certificados basados en esta evaluación.</CardDescription>
                         </CardHeader>
                         <CardContent className="flex flex-wrap gap-2">
                             <Button type="button" variant="outline" size="sm" onClick={() => handleGenerateDocument('action_plan')} disabled={isGeneratingDoc}>
                                  {isGeneratingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                 Plan de Acción
                             </Button>
                              <Button type="button" variant="destructive" size="sm" onClick={() => handleGenerateDocument('memorandum')} disabled={isGeneratingDoc || totalScore > 10}>
                                  {isGeneratingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                 Memorándum
                             </Button>
                         </CardContent>
                     </Card>
                 )}
                </div>
              )}

            </form>
          </Form>
        </CardContent>
      </Card>
      <EvaluationHistory employees={employees} onEdit={setSelectedEvaluation} />
    </div>
    {generatedDoc && (
        <EvaluationDocumentViewer
            isOpen={isDocViewerOpen}
            setIsOpen={setIsDocViewerOpen}
            title={generatedDoc.title}
            content={generatedDoc.content}
        />
    )}
    </>
  );
}
