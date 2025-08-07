
// src/components/settings/Appearance.tsx
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';


const accentColors = [
    { name: 'default', label: 'Predeterminado', color: 'hsl(330 84% 70%)' },
    { name: 'blue', label: 'Azul', color: 'hsl(221.2 83.2% 53.3%)' },
    { name: 'green', label: 'Verde', color: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'orange', label: 'Naranja', color: 'hsl(24.6 95% 53.1%)' },
];

export function Appearance() {
    const { theme, setTheme, accentColor, setAccentColor } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Apariencia y Tema</CardTitle>
                <CardDescription>
                    Personaliza cómo se ve y se siente el panel de control. Los cambios se guardan automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode" className="flex items-center gap-2">
                        <Sun className="h-5 w-5" /> / <Moon className="h-5 w-5" />
                        Modo Oscuro
                    </Label>
                    <Switch 
                        id="dark-mode"
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                       <Palette className="h-5 w-5" /> Color de Acento
                    </Label>
                     <div className="flex flex-wrap gap-2 pt-2">
                        {accentColors.map(ac => (
                             <Button 
                                key={ac.name} 
                                variant="outline" 
                                className={cn("flex items-center gap-2", accentColor === ac.name && "border-2 border-primary")}
                                onClick={() => setAccentColor(ac.name)}
                            >
                                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: ac.color }} />
                                {ac.label}
                                {accentColor === ac.name && <Check className="h-4 w-4" />}
                            </Button>
                        ))}
                    </div>
                </div>
                 <Separator />
                 <div className="space-y-2">
                    <Label>Densidad de la Interfaz</Label>
                    <RadioGroup defaultValue="normal" className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="compact" id="compact" disabled/>
                            <Label htmlFor="compact" className="font-normal text-muted-foreground">Compacta (Próximamente)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="normal" id="normal" checked />
                            <Label htmlFor="normal" className="font-normal">Normal</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    );
}
