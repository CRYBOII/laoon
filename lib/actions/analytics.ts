'use server';

import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';

// Analytics helper functions
export async function getAnalyticsData(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<{
    success: boolean;
    data?: Array<{
        date: string;
        revenue: number;
        orderCount: number;
        itemsSold: number;
    }>;
    message?: string;
}> {
    try {
        await dbConnect();

        const orders = await Order.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        }).sort({ createdAt: 1 });

        // Group data by the specified period
        const groupedData = new Map<string, { revenue: number; orderCount: number; itemsSold: number }>();

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            let key: string;

            if (groupBy === 'day') {
                key = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
                key = weekStart.toISOString().split('T')[0];
            } else {
                // month
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            }

            const existing = groupedData.get(key) || { revenue: 0, orderCount: 0, itemsSold: 0 };
            const itemsSold = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

            groupedData.set(key, {
                revenue: existing.revenue + order.totalAmount,
                orderCount: existing.orderCount + 1,
                itemsSold: existing.itemsSold + itemsSold,
            });
        });

        // Convert to array and sort
        const data = Array.from(groupedData.entries())
            .map(([date, stats]) => ({
                date,
                ...stats,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch analytics data',
        };
    }
}

// Get category-based revenue
export async function getCategoryRevenue(
    startDate: Date,
    endDate: Date
): Promise<{
    success: boolean;
    data?: Array<{ category: string; revenue: number; count: number }>;
    message?: string;
}> {
    try {
        await dbConnect();

        const orders = await Order.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // We need to get product categories - for now, we'll extract from product names
        // In a real app, you'd join with the Product collection
        const categoryData = new Map<string, { revenue: number; count: number }>();

        orders.forEach((order) => {
            order.items.forEach((item: any) => {
                // For now, use product name as category (you can improve this later)
                const category = item.productName;
                const existing = categoryData.get(category) || { revenue: 0, count: 0 };

                categoryData.set(category, {
                    revenue: existing.revenue + (item.priceAtSale * item.quantity),
                    count: existing.count + item.quantity,
                });
            });
        });

        const data = Array.from(categoryData.entries())
            .map(([category, stats]) => ({
                category,
                ...stats,
            }))
            .sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        console.error('Error fetching category revenue:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch category revenue',
        };
    }
}
