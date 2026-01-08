'use client';

import { useState, useEffect } from 'react';
import { getDailyRevenue } from '@/lib/actions/orders';
import { getAnalyticsData, getCategoryRevenue } from '@/lib/actions/analytics';
import { getShopConfig, updateShopName } from '@/lib/actions/settings';
import { IOrder } from '@/lib/models/Order';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useToast } from '@/lib/context/ToastContext';
import DailyReport from '@/components/DailyReport';
import SalesRevenueChart from '@/components/SalesRevenueChart';
import CategoryRevenueChart from '@/components/CategoryRevenueChart';
import Header from '@/components/Header';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [shopName, setShopName] = useState('Coffee Shop');
    const [newShopName, setNewShopName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [revenue, setRevenue] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Analytics state
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadData = async () => {
        try {
            const [revenueData, configData] = await Promise.all([
                getDailyRevenue(selectedDate),
                getShopConfig(),
            ]);
            setRevenue(revenueData.revenue);
            setOrderCount(revenueData.orderCount);
            setOrders(revenueData.orders);
            setShopName(configData.shopName);
            setNewShopName(configData.shopName);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
            // Calculate date range based on period
            const endDate = new Date();
            const startDate = new Date();

            if (period === 'day') {
                startDate.setDate(endDate.getDate() - 30); // Last 30 days
            } else if (period === 'week') {
                startDate.setDate(endDate.getDate() - 90); // Last 90 days (13 weeks)
            } else {
                startDate.setMonth(endDate.getMonth() - 12); // Last 12 months
            }

            const [analyticsResult, categoryResult] = await Promise.all([
                getAnalyticsData(startDate, endDate, period),
                getCategoryRevenue(startDate, endDate),
            ]);

            if (analyticsResult.success && analyticsResult.data) {
                setAnalyticsData(analyticsResult.data);
            }

            if (categoryResult.success && categoryResult.data) {
                setCategoryData(categoryResult.data);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    const handleUpdateShopName = async () => {
        if (!newShopName.trim()) {
            showToast(t('shopNameEmpty'), 'error');
            return;
        }
        setIsSaving(true);
        const result = await updateShopName(newShopName.trim());
        if (result.success) {
            setShopName(newShopName.trim());
            showToast(t('shopNameUpdated'), 'success');
        } else {
            showToast(t('shopNameUpdateFailed') + ': ' + result.message, 'error');
        }
        setIsSaving(false);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(new Date(e.target.value));
    };

    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-coffee-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header shopName={shopName} showNav={true} />

            <main className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h2>
                        <p className="text-gray-600 text-sm">{t('revenueAndSettings')}</p>
                    </div>
                </div>

                {/* Shop Settings */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('shopSettings')}</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newShopName}
                            onChange={(e) => setNewShopName(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base"
                            placeholder={t('shopName')}
                        />
                        <button
                            onClick={handleUpdateShopName}
                            disabled={isSaving || newShopName === shopName}
                            className="flex items-center gap-2 bg-coffee-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-coffee-700 active:scale-95 transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            <span>{isSaving ? t('saving') : t('save')}</span>
                        </button>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('selectDate')}</h3>
                    <input
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={handleDateChange}
                        className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base"
                    />
                </div>

                {/* Analytics Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{t('analytics')}</h3>

                        {/* Period Selector */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPeriod('day')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'day'
                                    ? 'bg-coffee-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {t('daily')}
                            </button>
                            <button
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'week'
                                    ? 'bg-coffee-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {t('weekly')}
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${period === 'month'
                                    ? 'bg-coffee-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {t('monthly')}
                            </button>
                        </div>
                    </div>

                    {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-coffee-600" size={40} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <SalesRevenueChart data={analyticsData} period={period} />
                            <CategoryRevenueChart data={categoryData} />
                        </div>
                    )}
                </div>

                {/* Daily Report */}
                <DailyReport
                    revenue={revenue}
                    orderCount={orderCount}
                    orders={orders}
                    date={selectedDate}
                    onRefresh={loadData}
                />
            </main>
        </div>
    );
}
