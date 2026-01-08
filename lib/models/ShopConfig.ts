import mongoose, { Schema, Model, models } from 'mongoose';

export interface IShopConfig {
    _id: string;
    shopName: string;
    updatedAt: Date;
}

const ShopConfigSchema = new Schema<IShopConfig>(
    {
        shopName: {
            type: String,
            required: true,
            default: 'Coffee Shop',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const ShopConfig: Model<IShopConfig> = models.ShopConfig || mongoose.model<IShopConfig>('ShopConfig', ShopConfigSchema);

export default ShopConfig;
