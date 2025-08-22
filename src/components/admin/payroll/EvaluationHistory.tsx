// src/components/admin/payroll/EvaluationHistory.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, Evaluation } from '@/types/firestore';
import { getEvaluations, deleteEvaluation } from '@/services/payrollService';
import { Loader2, Edit, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

interface EvaluationHistoryProps {
  employees: User[];
  onEdit: (evaluation: Evaluation) => void;
}

export function EvaluationHistory({ employees, onEdit }: EvaluationHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [period, setPeriod] = useState(
    `${new Date().toLocaleString('es-PE', { month: 'long' })} ${new Date().getFullYear()}`.replace(/^\w/, c => c.toUpperCase())
  );
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!selectedEmployeeId || !period) {
      toast({ variant: 'destructive', title: 'Faltan datos', description: 'Por favor, selecciona un empleado y un período.' });
      return;
    }
    setLoading(true);
    setEvaluations([]);
    try {
      const results = await getEvaluations(selectedEmployeeId, period);
      setEvaluations(results);
      if (results.length === 0) {
        toast({ title: 'Sin resultados', description: 'No se encontraron evaluaciones para la selección.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las evaluaciones.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (evaluationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) return;

    try {
        await deleteEvaluation(evaluationId);
        toast({ title: 'Evaluación eliminada' });
        handleSearch(); // Refresh the list
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la evaluación.' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Evaluaciones</CardTitle>
        <CardDescription>Busca y gestiona las evaluaciones de desempeño pasadas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
           <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
            <SelectTrigger><SelectValue placeholder="Selecciona Empleado" /></SelectTrigger>
            <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
          </Select>
           <Button onClick={handleSearch} disabled={loading || !selectedEmployeeId} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>
        <Separator />
        {loading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div>
        ) : evaluations.length === 0 ? (
            <p className="text-center text-muted-foreground pt-10">
                Selecciona un empleado y haz clic en buscar para ver su historial.
            </p>
        ) : (
            <div className="space-y-3">
                {evaluations.map(eva => (
                     <div key={eva.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{eva.period}</p>
                            <p className="text-sm text-muted-foreground">Puntaje: {eva.totalScore.toFixed(1)}/20 - Bono: S/{eva.bonus.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Evaluado el: {format(eva.createdAt.toDate(), "P", { locale: es })}</p>
                        </div>
                        <div className="flex gap-1">
                             <Button variant="outline" size="icon" onClick={() => onEdit(eva)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                             <Button variant="destructive" size="icon" onClick={() => handleDelete(eva.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                     </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
