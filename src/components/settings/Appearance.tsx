// src/components/settings/Appearance.tsx
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';


const accentColors = [
    { name: 'default', label: 'Predeterminado', color: 'hsl(330 84% 70%)' },
    { name: 'blue', label: 'Azul', color: 'hsl(221.2 83.2% 53.3%)' },
    { name: 'green', label: 'Verde', color: 'hsl(142.1 76.2% 36.3%)' },
    { name: 'orange', label: 'Naranja', color: 'hsl(24.6 95% 53.1%)' },
    { name: 'wine', label: 'Vino', color: 'hsl(347 77% 40%)' },
    { name: 'military-green', label: 'Verde Militar', color: 'hsl(84 20% 30%)' },
    { name: 'gold', label: 'Dorado', color: 'hsl(45 74% 47%)' },
] as const;

type Theme = 'dark' | 'light';
type AccentColor = (typeof accentColors)[number]['name'];
type Density = 'normal' | 'compact';


export function Appearance() {
    const [theme, setTheme] = useState<Theme>('light');
    const [accentColor, setAccentColor] = useState<AccentColor>('default');
    const [density, setDensity] = useState<Density>('normal');
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('anella-theme') as Theme | null;
        const savedAccent = localStorage.getItem('anella-accent-color') as AccentColor | null;
        const savedDensity = localStorage.getItem('anella-density') as Density | null;

        if (savedTheme) setTheme(savedTheme);
        if (savedAccent) setAccentColor(savedAccent);
        if (savedDensity) setDensity(savedDensity);

    }, []);
    
    const triggerStorageChange = () => {
        // This event is listened to by the layouts to update the className
        window.dispatchEvent(new Event('storage'));
    };

    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('anella-theme', newTheme);
        triggerStorageChange();
    };
    
    const handleAccentChange = (colorName: AccentColor) => {
        setAccentColor(colorName);
        localStorage.setItem('anella-accent-color', colorName);
        triggerStorageChange();
    };

    const handleDensityChange = (densityValue: Density) => {
        setDensity(densityValue);
        localStorage.setItem('anella-density', densityValue);
        triggerStorageChange();
    }

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
                        onCheckedChange={handleThemeChange}
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
                                onClick={() => handleAccentChange(ac.name)}
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
                    <RadioGroup value={density} onValueChange={(value) => handleDensityChange(value as Density)} className="flex gap-4 pt-2">
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
        </Card>
    );
}
