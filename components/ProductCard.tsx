'use client';

import { IProduct } from '@/lib/models/Product';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: IProduct;
    onAddToCart: (product: IProduct) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${product.isAvailable
                    ? 'border-coffee-200 hover:border-coffee-400 hover:shadow-lg'
                    : 'border-gray-200 opacity-60'
                }`}
        >
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">
                        {product.name}
                    </h3>
                    <p className="text-xs text-coffee-600 font-medium uppercase tracking-wide">
                        {product.category}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-bold text-coffee-700">
                        ฿{product.price.toFixed(2)}
                    </span>

                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.isAvailable}
                        className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg font-medium text-sm transition-all min-h-[48px] ${product.isAvailable
                                ? 'bg-coffee-600 text-white hover:bg-coffee-700 active:scale-95'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Plus size={18} />
                        <span>Add</span>
                    </button>
                </div>

                {!product.isAvailable && (
                    <p className="text-xs text-red-600 font-medium mt-2 text-center">
                        Out of Stock
                    </p>
                )}
            </div>
        </div>
    );
}
