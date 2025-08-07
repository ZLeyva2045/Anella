// src/components/settings/AdminSettings.tsx
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export function AdminSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración Avanzada</CardTitle>
                <CardDescription>
                    Gestiona permisos de usuario, integraciones y configuraciones globales de la plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Permisos para Nuevos Vendedores</Label>
                    <Select defaultValue="limited">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="limited">Acceso limitado (Ventas y Clientes)</SelectItem>
                            <SelectItem value="full">Acceso completo (Solo lectura a todo)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Define los permisos por defecto para los nuevos usuarios con rol de vendedor.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label>Webhooks y API</Label>
                    <p className="text-sm text-muted-foreground">
                        Gestiona las claves de API y los webhooks para integraciones externas.
                    </p>
                    <Button variant="outline">Gestionar Claves de API</Button>
                </div>
            </CardContent>
            <CardFooter>
                 <Button disabled>Guardar Cambios Avanzados</Button>
            </CardFooter>
        </Card>
    );
}
