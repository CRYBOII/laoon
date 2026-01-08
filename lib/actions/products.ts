'use server';

import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function getProducts(): Promise<IProduct[]> {
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ category: 1, name: 1 }).lean();
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
    }
}

export async function getAvailableProducts(): Promise<IProduct[]> {
    try {
        await dbConnect();
        const products = await Product.find({ isAvailable: true })
            .sort({ category: 1, name: 1 })
            .lean();
        return JSON.parse(JSON.stringify(products));
    } catch (error) {
        console.error('Error fetching available products:', error);
        throw new Error('Failed to fetch available products');
    }
}

export async function createProduct(data: {
    name: string;
    price: number;
    category: string;
}): Promise<{ success: boolean; message: string; product?: IProduct }> {
    try {
        await dbConnect();
        const product = await Product.create(data);
        revalidatePath('/admin/products');
        revalidatePath('/');
        return {
            success: true,
            message: 'Product created successfully',
            product: JSON.parse(JSON.stringify(product)),
        };
    } catch (error: any) {
        console.error('Error creating product:', error);
        return {
            success: false,
            message: error.message || 'Failed to create product',
        };
    }
}

export async function updateProduct(
    id: string,
    data: {
        name?: string;
        price?: number;
        category?: string;
        isAvailable?: boolean;
    }
): Promise<{ success: boolean; message: string; product?: IProduct }> {
    try {
        await dbConnect();
        const product = await Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return {
                success: false,
                message: 'Product not found',
            };
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        return {
            success: true,
            message: 'Product updated successfully',
            product: JSON.parse(JSON.stringify(product)),
        };
    } catch (error: any) {
        console.error('Error updating product:', error);
        return {
            success: false,
            message: error.message || 'Failed to update product',
        };
    }
}

export async function deleteProduct(
    id: string
): Promise<{ success: boolean; message: string }> {
    try {
        await dbConnect();
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return {
                success: false,
                message: 'Product not found',
            };
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        return {
            success: true,
            message: 'Product deleted successfully',
        };
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return {
            success: false,
            message: error.message || 'Failed to delete product',
        };
    }
}
