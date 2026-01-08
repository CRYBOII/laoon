'use client';

import Link from 'next/link';
import { Coffee, LayoutDashboard, Package, Languages } from 'lucide-react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface HeaderProps {
    shopName: string;
    showNav?: boolean;
}

export default function Header({ shopName, showNav = false }: HeaderProps) {
    const { t, language, setLanguage } = useTranslation();

    const toggleLanguage = () => {
        setLanguage(language === 'th' ? 'en' : 'th');
    };

    return (
        <header className="bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-lg sticky top-0 z-30">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <Coffee size={28} />
                        <h1 className="text-xl font-bold">{shopName}</h1>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 px-3 py-2 bg-coffee-800 hover:bg-coffee-900 rounded-lg transition-colors font-medium text-sm"
                            title="Change Language"
                        >
                            <Languages size={18} />
                            <span>{language === 'th' ? 'ไทย' : 'EN'}</span>
                        </button>

                        {showNav && (
                            <nav className="flex items-center gap-2">
                                <Link
                                    href="/admin/products"
                                    className="p-2 hover:bg-coffee-800 rounded-lg transition-colors"
                                    title={t('products')}
                                >
                                    <Package size={24} />
                                </Link>
                                <Link
                                    href="/admin/dashboard"
                                    className="p-2 hover:bg-coffee-800 rounded-lg transition-colors"
                                    title={t('dashboard')}
                                >
                                    <LayoutDashboard size={24} />
                                </Link>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
