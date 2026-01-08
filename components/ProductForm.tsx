'use client';

import { useState } from 'react';
import { IProduct } from '@/lib/models/Product';

interface ProductFormProps {
    product?: IProduct;
    onSubmit: (data: {
        name: string;
        price: number;
        category: string;
        isAvailable?: boolean;
    }) => Promise<void>;
    onCancel: () => void;
}

export default function ProductForm({
    product,
    onSubmit,
    onCancel,
}: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || 0,
        category: product?.category || '',
        isAvailable: product?.isAvailable ?? true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Product Name
                </label>
                <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base"
                    placeholder="e.g., Cappuccino"
                />
            </div>

            <div>
                <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Price (฿)
                </label>
                <input
                    type="number"
                    id="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base"
                    placeholder="0.00"
                />
            </div>

            <div>
                <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Category
                </label>
                <input
                    type="text"
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-base"
                    placeholder="e.g., Coffee, Tea, Pastry"
                />
            </div>

            {product && (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) =>
                            setFormData({ ...formData, isAvailable: e.target.checked })
                        }
                        className="w-5 h-5 text-coffee-600 border-gray-300 rounded focus:ring-coffee-500"
                    />
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        Available for sale
                    </label>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors min-h-[48px]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-coffee-600 text-white rounded-lg font-semibold hover:bg-coffee-700 transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : product ? 'Update' : 'Create'}
                </button>
            </div>
        </form>
    );
}
