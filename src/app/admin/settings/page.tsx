// src/app/admin/settings/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { SettingsPageContent } from '@/components/settings/SettingsPageContent';

export default function AdminSettingsPage() {
    const { firestoreUser } = useAuth();
    const isAdmin = firestoreUser?.role === 'manager';

    return <SettingsPageContent isAdmin={isAdmin} />;
}
