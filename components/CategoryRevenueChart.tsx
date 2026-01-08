'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface CategoryChartProps {
    data: Array<{
        category: string;
        revenue: number;
        count: number;
    }>;
}

const COLORS = ['#8b4513', '#d2691e', '#cd853f', '#deb887', '#f4a460', '#d2b48c', '#bc8f8f'];

export default function CategoryRevenueChart({ data }: CategoryChartProps) {
    const { t } = useTranslation();

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                {t('noData')}
            </div>
        );
    }

    const chartData = data.map((item, index) => ({
        name: item.category,
        value: item.revenue,
        count: item.count,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('categoryRevenue')}</h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | undefined, name, props: any) => [
                            `฿${(value ?? 0).toFixed(2)} (${props.payload.count} ${t('itemsSold')})`,
                            props.payload.name
                        ]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Summary Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                {t('productName')}
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                {t('itemsSold')}
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                {t('revenue')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.category}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.count}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    ฿{item.revenue.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
