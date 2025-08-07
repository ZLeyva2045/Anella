// src/components/settings/ProfileSecurity.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, History } from 'lucide-react';

export function ProfileSecurity() {
    const { firestoreUser } = useAuth();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Perfil y Seguridad</CardTitle>
                <CardDescription>
                    Actualiza tu información personal y protege tu cuenta.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={firestoreUser?.photoURL} alt={firestoreUser?.name} />
                        <AvatarFallback>{firestoreUser?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" defaultValue={firestoreUser?.name} />
                    </div>
                    <Button variant="outline" size="sm" className="self-end">Cambiar Foto</Button>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" defaultValue={firestoreUser?.email} disabled />
                </div>

                <Separator />
                
                <h3 className="font-semibold flex items-center gap-2"><ShieldCheck />Seguridad</h3>
                 <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Button variant="outline">Cambiar Contraseña</Button>
                 </div>
                 <div className="space-y-2">
                    <Label>Autenticación de Dos Factores (2FA)</Label>
                    <Button variant="outline" disabled>Activar 2FA</Button>
                    <p className="text-xs text-muted-foreground">Esta función estará disponible próximamente.</p>
                 </div>
                 
                 <Separator />

                 <h3 className="font-semibold flex items-center gap-2"><History />Historial de Sesiones</h3>
                 <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                    <p><strong>Dispositivo actual:</strong> Chrome en macOS - Cajamarca, PE</p>
                    <Button variant="link" className="p-0 h-auto text-destructive">Cerrar todas las demás sesiones</Button>
                 </div>

            </CardContent>
            <CardFooter>
                 <Button disabled>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    );
}
