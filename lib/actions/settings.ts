'use server';

import dbConnect from '@/lib/db';
import ShopConfig, { IShopConfig } from '@/lib/models/ShopConfig';
import { revalidatePath } from 'next/cache';

export async function getShopConfig(): Promise<IShopConfig> {
    try {
        await dbConnect();

        let config = await ShopConfig.findOne().lean();

        // Create default config if none exists
        if (!config) {
            config = await ShopConfig.create({ shopName: 'Coffee Shop' });
        }

        return JSON.parse(JSON.stringify(config));
    } catch (error) {
        console.error('Error fetching shop config:', error);
        throw new Error('Failed to fetch shop configuration');
    }
}

export async function updateShopName(
    shopName: string
): Promise<{ success: boolean; message: string; config?: IShopConfig }> {
    try {
        await dbConnect();

        let config = await ShopConfig.findOne();

        if (!config) {
            config = await ShopConfig.create({ shopName });
        } else {
            config.shopName = shopName;
            await config.save();
        }

        revalidatePath('/');
        revalidatePath('/admin/dashboard');

        return {
            success: true,
            message: 'Shop name updated successfully',
            config: JSON.parse(JSON.stringify(config)),
        };
    } catch (error: any) {
        console.error('Error updating shop name:', error);
        return {
            success: false,
            message: error.message || 'Failed to update shop name',
        };
    }
}
