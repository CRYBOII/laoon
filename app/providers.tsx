'use client';

import { LanguageProvider } from '@/lib/context/LanguageContext';
import { ToastProvider } from '@/lib/context/ToastContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </LanguageProvider>
    );
}
