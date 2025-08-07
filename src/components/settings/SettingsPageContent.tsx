// src/components/settings/SettingsPageContent.tsx
'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSecurity } from './ProfileSecurity';
import { Notifications } from './Notifications';
import { Appearance } from './Appearance';
import { AdminSettings } from './AdminSettings';
import { ShieldCheck, Palette, BellRing, Settings2 } from 'lucide-react';

interface SettingsPageContentProps {
    isAdmin: boolean;
}

export function SettingsPageContent({ isAdmin }: SettingsPageContentProps) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground">
                    Gestiona tu cuenta y las preferencias de la aplicación.
                </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
                    <TabsTrigger value="profile"><ShieldCheck className="md:mr-2" /> <span className="hidden md:inline">Perfil y Seguridad</span></TabsTrigger>
                    <TabsTrigger value="notifications"><BellRing className="md:mr-2" /> <span className="hidden md:inline">Notificaciones</span></TabsTrigger>
                    <TabsTrigger value="appearance"><Palette className="md:mr-2" /> <span className="hidden md:inline">Apariencia</span></TabsTrigger>
                    {isAdmin && <TabsTrigger value="admin"><Settings2 className="md:mr-2" /> <span className="hidden md:inline">Admin</span></TabsTrigger>}
                </TabsList>

                <TabsContent value="profile">
                    <ProfileSecurity />
                </TabsContent>
                <TabsContent value="notifications">
                    <Notifications />
                </TabsContent>
                <TabsContent value="appearance">
                    <Appearance />
                </TabsContent>
                {isAdmin && (
                    <TabsContent value="admin">
                        <AdminSettings />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
