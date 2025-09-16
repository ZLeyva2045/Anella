// src/app/dashboard/settings/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SettingsPageContent } from '@/components/settings/SettingsPageContent';
import { ArrowLeft } from 'lucide-react';


export default function DashboardSettingsPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen w-full bg-[#FFF9F2] p-4 md:p-8">
            <div className="container mx-auto">
                 <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                </Button>
                <SettingsPageContent isAdmin={false} />
            </div>
        </div>
    )
}
