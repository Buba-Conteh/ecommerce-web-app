# E-Commerce Database Schema

This document outlines the complete database schema for the e-commerce system, including all tables, their fields, and relationships.

## Table Overview

### Core Tables
1. **categories** - Product categories with hierarchical support
2. **brands** - Product brands
3. **products** - Main product information
4. **product_images** - Multiple images per product
5. **tags** - Product tags for filtering
6. **product_tag** - Many-to-many relationship between products and tags

### Customer Management
7. **customers** - Customer information (separate from users)
8. **addresses** - Customer shipping and billing addresses

### Shopping Cart
9. **carts** - Shopping cart information
10. **cart_items** - Individual items in shopping carts

### Orders & Payments
11. **orders** - Order information
12. **order_items** - Individual items in orders
13. **payments** - Payment information for orders

## Detailed Table Schemas

### 1. categories
```sql
- id (primary key)
- name (string)
- slug (string, unique)
- description (text, nullable)
- image (string, nullable)
- is_active (boolean, default: true)
- sort_order (integer, default: 0)
- parent_id (foreign key to categories, nullable)
- created_at, updated_at
```

**Relationships:**
- Self-referencing: `parent_id` → `categories.id` (for hierarchical categories)
- Has many: `products`

### 2. brands
```sql
- id (primary key)
- name (string)
- slug (string, unique)
- description (text, nullable)
- logo (string, nullable)
- website (string, nullable)
- is_active (boolean, default: true)
- sort_order (integer, default: 0)
- created_at, updated_at
```

**Relationships:**
- Has many: `products`

### 3. products
```sql
- id (primary key)
- name (string)
- slug (string, unique)
- description (text, nullable)
- short_description (text, nullable)
- price (decimal 10,2)
- compare_price (decimal 10,2, nullable)
- cost_price (decimal 10,2, nullable)
- sku (string, unique, nullable)
- barcode (string, nullable)
- stock_quantity (integer, default: 0)
- min_stock_quantity (integer, default: 0)
- track_stock (boolean, default: true)
- is_active (boolean, default: true)
- is_featured (boolean, default: false)
- weight (decimal 8,2, nullable)
- length (decimal 8,2, nullable)
- width (decimal 8,2, nullable)
- height (decimal 8,2, nullable)
- meta_title (string, nullable)
- meta_description (text, nullable)
- meta_keywords (string, nullable)
- category_id (foreign key to categories, nullable)
- brand_id (foreign key to brands, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `category`, `brand`
- Has many: `images`, `cartItems`, `orderItems`
- Belongs to many: `tags`

### 4. product_images
```sql
- id (primary key)
- product_id (foreign key to products)
- image_path (string)
- alt_text (string, nullable)
- is_primary (boolean, default: false)
- sort_order (integer, default: 0)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `product`

### 5. tags
```sql
- id (primary key)
- name (string)
- slug (string, unique)
- description (text, nullable)
- is_active (boolean, default: true)
- created_at, updated_at
```

**Relationships:**
- Belongs to many: `products`

### 6. product_tag (Pivot Table)
```sql
- id (primary key)
- product_id (foreign key to products)
- tag_id (foreign key to tags)
- created_at, updated_at
```

### 7. customers
```sql
- id (primary key)
- user_id (foreign key to users, nullable)
- first_name (string)
- last_name (string)
- email (string, unique)
- phone (string, nullable)
- date_of_birth (date, nullable)
- gender (enum: male, female, other, nullable)
- notes (text, nullable)
- is_active (boolean, default: true)
- email_verified (boolean, default: false)
- email_verified_at (timestamp, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `user`
- Has many: `addresses`, `carts`, `orders`

### 8. addresses
```sql
- id (primary key)
- customer_id (foreign key to customers)
- type (enum: shipping, billing, both, default: both)
- first_name (string)
- last_name (string)
- company (string, nullable)
- address_line_1 (string)
- address_line_2 (string, nullable)
- city (string)
- state (string)
- postal_code (string)
- country (string)
- phone (string, nullable)
- is_default (boolean, default: false)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `customer`

### 9. carts
```sql
- id (primary key)
- session_id (string, nullable)
- customer_id (foreign key to customers, nullable)
- user_id (foreign key to users, nullable)
- currency (string 3, default: USD)
- subtotal (decimal 10,2, default: 0)
- tax_amount (decimal 10,2, default: 0)
- discount_amount (decimal 10,2, default: 0)
- total (decimal 10,2, default: 0)
- notes (text, nullable)
- expires_at (timestamp, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `customer`, `user`
- Has many: `items`

### 10. cart_items
```sql
- id (primary key)
- cart_id (foreign key to carts)
- product_id (foreign key to products)
- quantity (integer)
- unit_price (decimal 10,2)
- total_price (decimal 10,2)
- product_options (json, nullable)
- notes (text, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `cart`, `product`

### 11. orders
```sql
- id (primary key)
- order_number (string, unique)
- customer_id (foreign key to customers)
- user_id (foreign key to users, nullable)
- status (enum: pending, confirmed, processing, shipped, delivered, cancelled, refunded, default: pending)
- currency (string 3, default: USD)
- subtotal (decimal 10,2)
- tax_amount (decimal 10,2, default: 0)
- shipping_amount (decimal 10,2, default: 0)
- discount_amount (decimal 10,2, default: 0)
- total (decimal 10,2)
- notes (text, nullable)
- customer_notes (text, nullable)
- shipping_method (string, nullable)
- payment_method (string, nullable)
- tracking_number (string, nullable)
- shipped_at (timestamp, nullable)
- delivered_at (timestamp, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `customer`, `user`
- Has many: `items`, `payments`

### 12. order_items
```sql
- id (primary key)
- order_id (foreign key to orders)
- product_id (foreign key to products)
- product_name (string) // Snapshot of product name at time of order
- product_sku (string, nullable)
- quantity (integer)
- unit_price (decimal 10,2)
- total_price (decimal 10,2)
- product_options (json, nullable)
- notes (text, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `order`, `product`

### 13. payments
```sql
- id (primary key)
- order_id (foreign key to orders)
- payment_method (string)
- transaction_id (string, nullable)
- payment_gateway (string, nullable)
- status (enum: pending, processing, completed, failed, cancelled, refunded, partially_refunded, default: pending)
- amount (decimal 10,2)
- currency (string 3, default: USD)
- payment_data (json, nullable)
- notes (text, nullable)
- processed_at (timestamp, nullable)
- created_at, updated_at
```

**Relationships:**
- Belongs to: `order`

## Key Features

### Hierarchical Categories
- Categories can have parent categories for creating category trees
- Self-referencing foreign key relationship

### Product Management
- Comprehensive product information including pricing, inventory, and dimensions
- Support for multiple images per product with primary image designation
- Product tagging system for better organization and filtering
- Brand association for product grouping

### Customer Management
- Separate customer table from users (allows guest customers)
- Multiple address support for shipping and billing
- Customer verification system

### Shopping Cart
- Session-based and customer-based cart support
- Automatic total calculations
- Cart expiration functionality

### Order System
- Complete order lifecycle tracking
- Multiple payment support per order
- Order item snapshots to preserve product information at time of purchase

### Payment Processing
- Multiple payment gateway support
- Payment status tracking
- Transaction data storage

## Indexes

The schema includes strategic indexes for:
- Active/featured products
- Category and brand filtering
- Customer email lookups
- Order status and date filtering
- Payment status tracking
- Cart session management

## Eloquent Models

All tables have corresponding Eloquent models with:
- Proper relationships defined
- Fillable fields configured
- Appropriate casts for data types
- Useful scopes for common queries
- Accessor methods for computed properties

This schema provides a solid foundation for a full-featured e-commerce system with room for future enhancements.
