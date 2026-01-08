'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface SalesRevenueChartProps {
    data: Array<{
        date: string;
        revenue: number;
        orderCount: number;
        itemsSold: number;
    }>;
    period: 'day' | 'week' | 'month';
}

export default function SalesRevenueChart({ data, period }: SalesRevenueChartProps) {
    const { t } = useTranslation();

    // Format date based on period
    const formatDate = (dateStr: string) => {
        if (period === 'month') {
            const [year, month] = dateStr.split('-');
            return `${month}/${year}`;
        }
        const date = new Date(dateStr);
        if (period === 'week') {
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const formattedData = data.map(item => ({
        ...item,
        displayDate: formatDate(item.date),
    }));

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                {t('noData')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('revenue')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            formatter={(value: number | undefined) => `฿${(value ?? 0).toFixed(2)}`}
                            labelFormatter={(label) => `${t('date')}: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#8b4513"
                            strokeWidth={2}
                            name={t('revenue')}
                            dot={{ fill: '#8b4513', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Sales Volume Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('salesVolume')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            labelFormatter={(label) => `${t('date')}: ${label}`}
                        />
                        <Legend />
                        <Bar
                            dataKey="itemsSold"
                            fill="#d2691e"
                            name={t('itemsSold')}
                        />
                        <Bar
                            dataKey="orderCount"
                            fill="#8b4513"
                            name={t('totalOrders')}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
