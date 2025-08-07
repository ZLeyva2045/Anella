// src/components/settings/Notifications.tsx
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Mail, BellRing, Volume2 } from 'lucide-react';
import { Separator } from '../ui/separator';

export function Notifications() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>
                    Gestiona cómo te mantenemos informado sobre la actividad de la tienda.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Nuevos Pedidos por Email
                    </Label>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="inapp-notifications" className="flex items-center gap-2">
                        <BellRing className="h-5 w-5" />
                        Notificaciones en la App
                    </Label>
                    <Switch id="inapp-notifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="sound-notifications" className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5" />
                        Sonidos de Notificación
                    </Label>
                    <Switch id="sound-notifications" />
                </div>
            </CardContent>
            <CardFooter>
                 <Button disabled>Guardar Preferencias</Button>
            </CardFooter>
        </Card>
    );
}
