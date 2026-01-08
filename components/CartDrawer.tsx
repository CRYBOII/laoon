'use client';

import { IProduct } from '@/lib/models/Product';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';

export interface CartItem {
    product: IProduct;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: (notes: string) => void;
    onClearCart: () => void;
}

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onClearCart,
}: CartDrawerProps) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        setIsProcessing(true);
        await onCheckout(notes);
        setNotes(''); // Clear notes after checkout
        setIsProcessing(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-coffee-600" size={24} />
                        <h2 className="text-lg font-bold text-gray-900">
                            {t('cart')} ({totalItems})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div
                                key={item.product._id}
                                className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                                        {item.product.name}
                                    </h3>
                                    <p className="text-coffee-600 font-medium text-sm">
                                        ฿{item.product.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            onUpdateQuantity(item.product._id, item.quantity - 1)
                                        }
                                        className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold text-gray-900 min-w-[2rem] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            onUpdateQuantity(item.product._id, item.quantity + 1)
                                        }
                                        className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => onRemoveItem(item.product._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
                        {/* Notes Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orderNotes')}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t('notesPlaceholder')}
                                maxLength={500}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-sm resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">{t('total')}</span>
                            <span className="text-2xl font-bold text-coffee-700">
                                ฿{totalAmount.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onClearCart}
                                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all min-h-[52px]"
                            >
                                {t('clearCart')}
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="flex-[2] py-3 px-4 bg-coffee-600 text-white rounded-lg font-semibold hover:bg-coffee-700 active:scale-95 transition-all min-h-[52px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? t('saving') : t('checkout')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
