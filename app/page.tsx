'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/lib/models/Product';
import { getAvailableProducts } from '@/lib/actions/products';
import { createOrder } from '@/lib/actions/orders';
import { getShopConfig } from '@/lib/actions/settings';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useToast } from '@/lib/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import Header from '@/components/Header';
import { ShoppingCart, Loader2 } from 'lucide-react';

export default function POSPage() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [shopName, setShopName] = useState('Coffee Shop');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, configData] = await Promise.all([
                getAvailableProducts(),
                getShopConfig(),
            ]);
            setProducts(productsData);
            setShopName(configData.shopName);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (product: IProduct) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.product._id === product._id);
            if (existing) {
                return prev.map((item) =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        setCartItems((prev) =>
            prev.map((item) =>
                item.product._id === productId ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    };

    const handleCheckout = async (notes: string) => {
        if (cartItems.length === 0) return;

        const orderItems = cartItems.map((item) => ({
            productId: item.product._id,
            productName: item.product.name,
            quantity: item.quantity,
            priceAtSale: item.product.price,
        }));

        const totalAmount = cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        const result = await createOrder(orderItems, totalAmount, notes);

        if (result.success) {
            setCartItems([]);
            setIsCartOpen(false);
            showToast(t('orderCompleted'), 'success');
        } else {
            showToast(t('orderFailed') + ': ' + result.message, 'error');
        }
    };

    const handleClearCart = () => {
        if (confirm(t('clearCartConfirm'))) {
            setCartItems([]);
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

            <main className="container mx-auto px-4 py-6 pb-24">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('menu')}</h2>
                    <p className="text-gray-600">{t('selectItems')}</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">{t('noProducts')}</p>
                        <p className="text-sm text-gray-400 mt-2">
                            {t('addProductsFromAdmin')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Cart Button */}
            {cartItems.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 right-6 bg-coffee-600 text-white rounded-full p-4 shadow-2xl hover:bg-coffee-700 active:scale-95 transition-all z-30 flex items-center gap-2"
                >
                    <ShoppingCart size={24} />
                    <span className="bg-white text-coffee-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm">
                        {totalItems}
                    </span>
                </button>
            )}

            {/* Cart Drawer */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                onClearCart={handleClearCart}
            />
        </div>
    );
}
