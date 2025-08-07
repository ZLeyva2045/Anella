// src/components/settings/Appearance.tsx
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const accentColors = [
    { name: 'Predeterminado', color: 'hsl(336 84% 60%)' },
    { name: 'Azul', color: '#3b82f6' },
    { name: 'Verde', color: '#22c55e' },
    { name: 'Naranja', color: '#f97316' },
];

export function Appearance() {
    // Lógica para modo oscuro y color de acento iría aquí
    // Por ahora, es solo UI

    return (
        <Card>
            <CardHeader>
                <CardTitle>Apariencia y Tema</CardTitle>
                <CardDescription>
                    Personaliza cómo se ve y se siente el panel de control.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="flex items-center gap-2">
                        <Sun className="h-5 w-5" /> / <Moon className="h-5 w-5" />
                        Modo Oscuro
                    </Label>
                    <Switch id="dark-mode" />
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                       <Palette className="h-5 w-5" /> Color de Acento
                    </Label>
                     <div className="flex flex-wrap gap-2 pt-2">
                        {accentColors.map(ac => (
                             <Button key={ac.name} variant="outline" className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: ac.color }} />
                                {ac.name}
                            </Button>
                        ))}
                    </div>
                </div>
                <Separator />
                 <div className="space-y-2">
                    <Label>Densidad de la Interfaz</Label>
                    <RadioGroup defaultValue="normal" className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="compact" id="compact" />
                            <Label htmlFor="compact" className="font-normal">Compacta</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="normal" />
                            <Label htmlFor="normal" className="font-normal">Normal</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter>
                 <Button disabled>Guardar Apariencia</Button>
            </CardFooter>
        </Card>
    );
}
