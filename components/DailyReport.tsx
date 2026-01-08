'use client';

import { IOrder } from '@/lib/models/Order';
import { deleteOrder } from '@/lib/actions/orders';
import { Calendar, DollarSign, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useToast } from '@/lib/context/ToastContext';
import OrderEditModal from './OrderEditModal';

interface DailyReportProps {
    revenue: number;
    orderCount: number;
    orders: IOrder[];
    date: Date;
    onRefresh?: () => void;
}

export default function DailyReport({
    revenue,
    orderCount,
    orders,
    date,
    onRefresh,
}: DailyReportProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async (orderId: string) => {
        if (!confirm(t('deleteOrderConfirm'))) {
            return;
        }

        setIsDeleting(orderId);
        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                showToast(t('orderDeleted'), 'success');
                if (onRefresh) onRefresh();
            } else {
                showToast(t('orderDeleteFailed') + ': ' + result.message, 'error');
            }
        } catch (error) {
            showToast(t('errorDeletingOrder'), 'error');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleEdit = (order: IOrder) => {
        setEditingOrder(order);
    };

    const handleCloseEdit = () => {
        setEditingOrder(null);
        if (onRefresh) onRefresh();
    };

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-coffee-500 to-coffee-700 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign size={24} />
                        <h3 className="font-semibold text-sm opacity-90">{t('totalRevenue')}</h3>
                    </div>
                    <p className="text-3xl font-bold">฿{revenue.toFixed(2)}</p>
                </div>

                <div className="bg-gradient-to-br from-coffee-400 to-coffee-600 text-white rounded-lg p-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag size={24} />
                        <h3 className="font-semibold text-sm opacity-90">{t('totalOrders')}</h3>
                    </div>
                    <p className="text-3xl font-bold">{orderCount}</p>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-coffee-100 px-4 py-3 border-b border-coffee-200">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-coffee-700" />
                        <h3 className="font-bold text-coffee-900">
                            {t('orders')} - {formatDate(date)}
                        </h3>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>{t('noOrders')}</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">
                                            {formatTime(order.createdAt)}
                                        </p>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <p key={idx} className="text-sm text-gray-700">
                                                    <span className="font-medium">{item.quantity}x</span>{' '}
                                                    {item.productName}
                                                    <span className="text-gray-500 ml-2">
                                                        ฿{item.priceAtSale.toFixed(2)}
                                                    </span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-lg font-bold text-coffee-700 mb-2">
                                            ฿{order.totalAmount.toFixed(2)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit order"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                disabled={isDeleting === order._id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingOrder && (
                <OrderEditModal
                    order={editingOrder}
                    onClose={handleCloseEdit}
                />
            )}
        </div>
    );
}

