// src/components/admin/payroll/reports/ReportGenerator.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, ReportData } from '@/types/firestore';
import { generateEmployeeReportData } from '@/services/reportService';
import { Loader2, FileText, Printer, ThumbsUp, Goal, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PerformanceSummary } from './PerformanceSummary';
import { AttendanceCalendar } from './AttendanceCalendar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportGeneratorProps {
  employees: User[];
}

export function ReportGenerator({ employees }: ReportGeneratorProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedEmployeeId || !selectedMonth) return;
    setLoading(true);
    setReportData(null);
    const [year, month] = selectedMonth.split('-').map(Number);
    const report = await generateEmployeeReportData(selectedEmployeeId, new Date(year, month - 1, 15));
    setReportData(report);
    setLoading(false);
  };
  
  const generateMonthOptions = () => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
        const monthStr = format(date, 'MMMM yyyy', { locale: es });
        options.push({ label: monthStr.charAt(0).toUpperCase() + monthStr.slice(1), value: format(date, 'yyyy-MM') });
        date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Generación de Reportes</CardTitle>
            <CardDescription>Selecciona un empleado y un período para generar su reporte de desempeño detallado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger>
                    <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
                </Select>
                 <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecciona un mes" /></SelectTrigger>
                    <SelectContent>{generateMonthOptions().map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleGenerateReport} disabled={!selectedEmployeeId || !selectedMonth || loading} className="w-full md:w-auto">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                    Generar Reporte
                </Button>
            </div>
             {loading && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
             
             {reportData && (
                <div className="space-y-6 pt-4 animate-in fade-in-50" id="report-content">
                     <style jsx global>{`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #report-content, #report-content * {
                                visibility: visible;
                            }
                            #report-content {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    `}</style>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{reportData.employee.name}</h2>
                            <p className="text-muted-foreground">Reporte de Desempeño - {reportData.period}</p>
                        </div>
                        <Button variant="outline" className="no-print" onClick={() => window.print()}>
                            <Printer className="mr-2" /> Imprimir
                        </Button>
                    </div>
                    <Separator />
                    
                    {reportData.evaluation ? <PerformanceSummary evaluation={reportData.evaluation} /> : <p className="text-center text-muted-foreground">No se encontró evaluación para este período.</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                           <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><ThumbsUp className="text-green-500"/>Reconocimientos</CardTitle></CardHeader>
                           <CardContent className="space-y-2 max-h-40 overflow-y-auto">{reportData.feedback.recognitions.length > 0 ? reportData.feedback.recognitions.map(fb => <p key={fb.id} className="text-sm p-2 border-l-4 border-green-500 bg-green-50">{fb.comment}</p>) : <p className="text-sm text-muted-foreground">Sin reconocimientos este mes.</p>}</CardContent>
                        </Card>
                        <Card>
                           <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Goal className="text-yellow-500"/>Áreas de Mejora</CardTitle></CardHeader>
                           <CardContent className="space-y-2 max-h-40 overflow-y-auto">{reportData.feedback.improvements.length > 0 ? reportData.feedback.improvements.map(fb => <p key={fb.id} className="text-sm p-2 border-l-4 border-yellow-500 bg-yellow-50">{fb.comment}</p>) : <p className="text-sm text-muted-foreground">Sin áreas de mejora este mes.</p>}</CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="text-red-500"/>Tardanzas y Penalidad</CardTitle></CardHeader>
                            <CardContent className="text-center pt-4">
                                <p className="text-4xl font-bold">{reportData.tardinessCount}</p>
                                <p className="text-sm text-muted-foreground">Tardanzas registradas</p>
                                <Separator className="my-2" />
                                <p className="text-2xl font-bold text-destructive">- S/ {reportData.tardinessPenalty.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Penalidad total</p>
                            </CardContent>
                        </Card>
                    </div>

                    {reportData.evaluation?.comments && (
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare />Comentarios Generales del Evaluador</CardTitle></CardHeader>
                            <CardContent><p className="text-sm italic">"{reportData.evaluation.comments}"</p></CardContent>
                        </Card>
                    )}

                    <AttendanceCalendar attendanceData={reportData.attendance} month={new Date(selectedMonth + '-15')} />
                </div>
             )}
        </CardContent>
    </Card>
  );
}
