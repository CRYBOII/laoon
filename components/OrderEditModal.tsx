'use client';

import { useState, useEffect } from 'react';
import { IOrder, IOrderItem } from '@/lib/models/Order';
import { IProduct } from '@/lib/models/Product';
import { updateOrder } from '@/lib/actions/orders';
import { getAvailableProducts } from '@/lib/actions/products';
import { useToast } from '@/lib/context/ToastContext';
import { X, Plus, Minus, Trash2, Save } from 'lucide-react';

interface OrderEditModalProps {
    order: IOrder;
    onClose: () => void;
}

export default function OrderEditModal({ order, onClose }: OrderEditModalProps) {
    const { showToast } = useToast();
    const [items, setItems] = useState<IOrderItem[]>(order.items);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const productsData = await getAvailableProducts();
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            showToast('Error loading products', 'error');
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0);
    };

    const handleQuantityChange = (index: number, newQuantity: number) => {
        if (newQuantity < 1) {
            // If quantity goes to 0 or less, remove the item
            handleRemoveItem(index);
            return;
        }
        if (newQuantity > 100) {
            showToast('Quantity cannot exceed 100', 'error');
            return;
        }
        const newItems = [...items];
        newItems[index].quantity = newQuantity;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) {
            showToast('Order must have at least one item', 'error');
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAddProduct = (product: IProduct) => {
        const existingIndex = items.findIndex(item => item.productId === product._id);
        if (existingIndex >= 0) {
            handleQuantityChange(existingIndex, items[existingIndex].quantity + 1);
        } else {
            setItems([...items, {
                productId: product._id,
                productName: product.name,
                quantity: 1,
                priceAtSale: product.price,
            }]);
        }
        setShowAddProduct(false);
    };

    const handleSave = async () => {
        if (items.length === 0) {
            showToast('Order must have at least one item', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateOrder(order._id, items, calculateTotal());
            if (result.success) {
                showToast('Order updated successfully!', 'success');
                onClose();
            } else {
                showToast('Failed to update order: ' + result.message, 'error');
            }
        } catch (error) {
            showToast('Error updating order', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-coffee-600 text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Edit Order</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-coffee-700 rounded transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Order ID: <span className="font-mono">{order._id}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Created: {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 mb-4">
                        {items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                    <p className="text-sm text-gray-600">฿{item.priceAtSale.toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                        disabled={items.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="font-bold text-coffee-700">
                                        ฿{(item.priceAtSale * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Product Button */}
                    {!showAddProduct ? (
                        <button
                            onClick={() => setShowAddProduct(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-coffee-500 hover:text-coffee-600 transition-colors font-medium"
                        >
                            + Add Product
                        </button>
                    ) : (
                        <div className="border-2 border-coffee-500 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">Select Product</h3>
                                <button
                                    onClick={() => setShowAddProduct(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {products.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => handleAddProduct(product)}
                                        className="p-3 bg-white border border-gray-300 rounded-lg hover:border-coffee-500 hover:bg-coffee-50 transition-colors text-left"
                                    >
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-600">฿{product.price.toFixed(2)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-coffee-700">
                                ฿{calculateTotal().toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-6 py-3 bg-coffee-600 text-white rounded-lg font-semibold hover:bg-coffee-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
