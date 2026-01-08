'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/lib/models/Product';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '@/lib/actions/products';
import { getShopConfig } from '@/lib/actions/settings';
import { useToast } from '@/lib/context/ToastContext';
import ProductForm from '@/components/ProductForm';
import Header from '@/components/Header';
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
    const { showToast } = useToast();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [shopName, setShopName] = useState('Coffee Shop');
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, configData] = await Promise.all([
                getProducts(),
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

    const handleCreateProduct = async (data: {
        name: string;
        price: number;
        category: string;
    }) => {
        const result = await createProduct(data);
        if (result.success) {
            await loadData();
            setShowForm(false);
            showToast('Product created successfully!', 'success');
        } else {
            showToast('Failed to create product: ' + result.message, 'error');
        }
    };

    const handleUpdateProduct = async (data: {
        name: string;
        price: number;
        category: string;
        isAvailable?: boolean;
    }) => {
        if (!editingProduct) return;
        const result = await updateProduct(editingProduct._id, data);
        if (result.success) {
            await loadData();
            setEditingProduct(null);
            setShowForm(false);
            showToast('Product updated successfully!', 'success');
        } else {
            showToast('Failed to update product: ' + result.message, 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const result = await deleteProduct(id);
        if (result.success) {
            await loadData();
            showToast('Product deleted successfully!', 'success');
        } else {
            showToast('Failed to delete product: ' + result.message, 'error');
        }
    };

    const handleEdit = (product: IProduct) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

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

            <main className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                            <p className="text-gray-600 text-sm">Manage your menu items</p>
                        </div>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 bg-coffee-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-coffee-700 active:scale-95 transition-all min-h-[48px]"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {editingProduct ? 'Edit Product' : 'New Product'}
                        </h3>
                        <ProductForm
                            product={editingProduct || undefined}
                            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                            onCancel={handleCancelForm}
                        />
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {products.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <p>No products yet</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Click "Add Product" to create your first product
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-coffee-100 border-b border-coffee-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-900">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-900">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-900">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-900">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-coffee-900">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                {product.name}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {product.category}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-coffee-700">
                                                ฿{product.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span
                                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.isAvailable
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
