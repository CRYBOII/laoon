# Coffee Shop POS - Setup Instructions

## Prerequisites
Before running this application, you need to install Node.js:

1. Download Node.js LTS from: https://nodejs.org/
2. Install Node.js (this will also install npm)
3. Restart your terminal/PowerShell after installation

## Installation

Once Node.js is installed, run the following commands in the project directory:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at: http://localhost:3000

## Database Setup

The application is configured to use MongoDB. Your connection string is already set in `.env.local`:
```
MONGODB_URI=mongodb+srv://laoon:2568@cluster.mongodb.net/myDatabase
```

Make sure your MongoDB database is accessible and the connection string is correct.

## Project Structure

```
posLaoon/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # POS Terminal (main page)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── admin/
│       ├── products/page.tsx     # Product management
│       └── dashboard/page.tsx    # Dashboard & settings
├── components/                   # React components
│   ├── ProductCard.tsx           # Product display card
│   ├── CartDrawer.tsx            # Shopping cart drawer
│   ├── DailyReport.tsx           # Revenue report
│   ├── ProductForm.tsx           # Add/Edit product form
│   └── Header.tsx                # App header
├── lib/
│   ├── db.ts                     # MongoDB connection
│   ├── models/                   # Mongoose schemas
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   └── ShopConfig.ts
│   └── actions/                  # Server actions
│       ├── products.ts
│       ├── orders.ts
│       └── settings.ts
└── .env.local                    # Environment variables
```

## Features

### POS Terminal (/)
- Browse available products in a mobile-optimized grid
- Add products to cart with quantity controls
- Floating cart button with item count
- Slide-up cart drawer for checkout
- Touch-friendly interface (44px+ touch targets)

### Product Management (/admin/products)
- View all products in a table
- Add new products
- Edit existing products
- Delete products
- Toggle product availability

### Dashboard (/admin/dashboard)
- View daily revenue
- See order history
- Change shop name
- Select different dates for historical data

## Mobile-First Design

This application is optimized for mobile devices (Zenfone 10 size):
- All touch targets are minimum 44px
- One-handed operation friendly
- Responsive grid layouts
- Slide-up cart drawer
- Large, clear typography
- Coffee shop themed color palette

## Usage Tips

1. **First Time Setup**: 
   - Go to `/admin/products` to add your menu items
   - Go to `/admin/dashboard` to set your shop name

2. **Taking Orders**:
   - Use the main page (`/`) as your POS terminal
   - Tap products to add to cart
   - Use the floating cart button to review and checkout

3. **Viewing Reports**:
   - Go to `/admin/dashboard`
   - Select a date to view historical revenue
   - See all orders for that day

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS (mobile-first)
- **Icons**: Lucide React
- **Language**: TypeScript
