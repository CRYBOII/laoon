import mongoose, { Schema, Model, models } from 'mongoose';

export interface IOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    priceAtSale: number;
}

export interface IOrder {
    _id: string;
    items: IOrderItem[];
    totalAmount: number;
    notes?: string;
    createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        productId: {
            type: String,
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        priceAtSale: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: 'Order must have at least one item',
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Order: Model<IOrder> = models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
