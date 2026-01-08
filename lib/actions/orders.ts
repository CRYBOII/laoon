'use server';

import dbConnect from '@/lib/db';
import Order, { IOrder, IOrderItem } from '@/lib/models/Order';
import { revalidatePath } from 'next/cache';

export async function createOrder(
    items: IOrderItem[],
    totalAmount: number,
    notes?: string
): Promise<{ success: boolean; message: string; order?: IOrder }> {
    try {
        await dbConnect();
        const order = await Order.create({
            items,
            totalAmount,
            notes: notes || '',
        });

        revalidatePath('/admin/dashboard');
        return {
            success: true,
            message: 'Order created successfully',
            order: JSON.parse(JSON.stringify(order)),
        };
    } catch (error: any) {
        console.error('Error creating order:', error);
        return {
            success: false,
            message: error.message || 'Failed to create order',
        };
    }
}

export async function getOrders(date?: Date): Promise<IOrder[]> {
    try {
        await dbConnect();

        let query = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query = {
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
            };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }
}

export async function getDailyRevenue(date: Date): Promise<{
    revenue: number;
    orderCount: number;
    orders: IOrder[];
}> {
    try {
        await dbConnect();

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        }).sort({ createdAt: -1 }).lean();

        const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
            revenue,
            orderCount: orders.length,
            orders: JSON.parse(JSON.stringify(orders)),
        };
    } catch (error) {
        console.error('Error calculating daily revenue:', error);
        throw new Error('Failed to calculate daily revenue');
    }
}

export async function getOrderById(orderId: string): Promise<IOrder | null> {
    try {
        await dbConnect();
        const order = await Order.findById(orderId).lean();
        if (!order) return null;
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('Error fetching order:', error);
        throw new Error('Failed to fetch order');
    }
}

export async function updateOrder(
    orderId: string,
    items: IOrderItem[],
    totalAmount: number,
    notes?: string
): Promise<{ success: boolean; message: string; order?: IOrder }> {
    try {
        await dbConnect();

        if (!items || items.length === 0) {
            return {
                success: false,
                message: 'Order must have at least one item',
            };
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                items,
                totalAmount,
                notes: notes || '',
            },
            { new: true, runValidators: true }
        );

        if (!order) {
            return {
                success: false,
                message: 'Order not found',
            };
        }

        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/orders');
        return {
            success: true,
            message: 'Order updated successfully',
            order: JSON.parse(JSON.stringify(order)),
        };
    } catch (error: any) {
        console.error('Error updating order:', error);
        return {
            success: false,
            message: error.message || 'Failed to update order',
        };
    }
}

export async function deleteOrder(
    orderId: string
): Promise<{ success: boolean; message: string }> {
    try {
        await dbConnect();

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return {
                success: false,
                message: 'Order not found',
            };
        }

        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/orders');
        return {
            success: true,
            message: 'Order deleted successfully',
        };
    } catch (error: any) {
        console.error('Error deleting order:', error);
        return {
            success: false,
            message: error.message || 'Failed to delete order',
        };
    }
}

