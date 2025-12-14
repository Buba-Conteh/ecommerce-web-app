# Order Creation & Database Flow Analysis

## Executive Summary
When creating or storing an order, **8 main tables** are affected in a coordinated sequence. The key is to maintain **data consistency**, **atomicity**, and **optimize queries** through proper relationships and transactions.

---

## Tables Affected During Order Creation

### 1. **ORDERS Table** (Primary)
**Role:** Master record of the entire transaction

**Fields Updated:**
- `order_number` - Unique identifier (generated)
- `customer_id` - Links to customer
- `user_id` - Admin/staff reference (nullable)
- `shipping_address_id` - Shipping location
- `status` - Initial state (pending)
- `currency` - Transaction currency
- `subtotal` - Sum before tax/shipping
- `tax_amount` - Calculated tax
- `shipping_amount` - Shipping cost
- `discount_amount` - Any discount applied
- `total` - Final amount (subtotal + tax + shipping - discount)
- `notes`, `customer_notes` - Internal/customer notes
- `shipping_method` - Selected method
- `payment_method` - Initial method (updated by Payment table)
- `tracking_number` - Added later (nullable)
- `shipped_at`, `delivered_at` - Timeline (nullable)

**Optimization:** Index on `customer_id`, `status`, `created_at`

---

### 2. **CUSTOMERS Table** (Referenced)
**Role:** Customer information lookup

**Data Read (not modified):**
- `id` - Used as foreign key
- `first_name`, `last_name` - For display/receipts
- `email` - For notifications
- `phone` - Contact info

**Note:** Can link to `users` table for registered customers or be standalone for guests.

---

### 3. **CARTS Table** (Source)
**Role:** Pre-order shopping cart data

**Data Read:**
- `cart_id` - Source of order items
- `subtotal`, `tax_amount`, `discount_amount` - Used to calculate order totals
- `currency` - Applied to order

**Action After Order:** Can be cleared/archived

---

### 4. **CART_ITEMS Table** (Source)
**Role:** Individual items from cart

**Data Read:**
- `product_id` - Which product
- `quantity` - How many
- `unit_price` - Price at time of cart
- `total_price` - Subtotal for item
- `product_options` - Variants/customizations (size, color, etc.)

**Flow:** Cart items are **copied** to order_items (not deleted initially, may be archived later)

---

### 5. **ORDER_ITEMS Table** (Created)
**Role:** Order line items (snapshot of cart at purchase time)

**Fields Populated:**
- `order_id` - Link to parent order
- `product_id` - Product reference
- `product_name` - Snapshot of name (for history)
- `product_sku` - Snapshot of SKU
- `quantity` - From cart
- `unit_price` - Price at purchase
- `total_price` - quantity × unit_price
- `product_options` - Variants data (JSON)
- `notes` - Item-specific notes

**Why:** Preserves data for historical accuracy (product info may change later)

**Optimization:** Index on `order_id`, compound index on `order_id` + `product_id`

---

### 6. **PRODUCTS Table** (Referenced)
**Role:** Product inventory & metadata

**Data Read:**
- `id` - Product identifier
- `stock_quantity` - Current inventory
- `min_stock_quantity` - Reorder alert level
- `track_stock` - Flag if stock is managed

**Data Updated (if `track_stock` = true):**
- **Decrement** `stock_quantity` by order quantity
- Trigger low-stock alerts if `stock_quantity` falls below `min_stock_quantity`

**Critical Operation:** Must use **atomic transaction** to prevent overselling
```php
// Pseudocode
foreach (orderItems as item) {
    Product::lockForUpdate()
        ->where('id', item.product_id)
        ->decrement('stock_quantity', item.quantity);
}
```

**Optimization:** Lock rows during order creation to prevent race conditions

---

### 7. **ADDRESSES Table** (Referenced)
**Role:** Shipping address storage

**Data Read:**
- `id` (shipping_address_id) - Which address to ship to
- `first_name`, `last_name`
- `address_line_1`, `address_line_2`
- `city`, `state`, `postal_code`, `country`
- `phone` - Carrier contact

**Action:** Address is **linked** but not modified (historical integrity)

---

### 8. **PAYMENTS Table** (Related)
**Role:** Payment processing status

**Fields Populated (after payment processing):**
- `order_id` - Link to order
- `payment_method` - How customer paid
- `transaction_id` - Gateway transaction ID
- `payment_gateway` - Provider (Stripe, PayPal, etc.)
- `status` - Initial state (pending)
- `amount` - Total amount charged
- `currency` - Currency
- `payment_data` - JSON response from gateway
- `notes` - Transaction notes
- `processed_at` - When payment cleared

**Timeline:** Created **after** order, during/post checkout

---

## Additional Related Tables (Supporting)

### **PRODUCT_IMAGES Table**
- Referenced to show product images in order confirmation emails
- Not modified, but read for display

### **PRODUCT_TAG, TAGS Tables**
- Referenced for order history/analytics
- Not modified during order creation

---

## Order Creation Flow (Optimized)

```
┌─────────────────────────────────────────┐
│ 1. START TRANSACTION                    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 2. VALIDATE & LOCK (Pessimistic)        │
│    - Lock products by ID                │
│    - Check stock availability            │
│    - Validate prices                    │
│    - Lock customer record (optional)    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 3. GENERATE ORDER RECORD                │
│    - Generate unique order_number       │
│    - Create order with initial status   │
│    - Link to customer & address         │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 4. CREATE ORDER_ITEMS                   │
│    - Copy from CART_ITEMS               │
│    - Snapshot product data              │
│    - Set initial quantities             │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 5. UPDATE PRODUCT STOCK                 │
│    - Decrement stock_quantity           │
│    - Check for low stock alerts         │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 6. CALCULATE TOTALS                     │
│    - Recalculate tax (if needed)        │
│    - Confirm shipping cost              │
│    - Apply discounts                    │
│    - Set final total                    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 7. CREATE PAYMENT RECORD                │
│    - Create payment with pending status │
│    - Queue for payment gateway          │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 8. ARCHIVE/CLEAR CART (Optional)        │
│    - Delete or mark cart as converted   │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 9. COMMIT TRANSACTION                   │
│    - All or nothing!                    │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 10. TRIGGER ASYNC JOBS                  │
│    - Send confirmation email             │
│    - Notify admin                       │
│    - Update inventory report            │
│    - Queue shipment prep                │
└─────────────────────────────────────────┘
```

---

## Optimized Code Architecture

### Recommended Structure

```php
app/
├── Services/
│   ├── OrderService.php          ← Main orchestrator
│   ├── OrderCalculationService.php ← Tax, totals, discounts
│   ├── InventoryService.php      ← Stock management
│   ├── PaymentService.php        ← Payment handling
│   └── CartService.php           ← Cart operations
├── Actions/
│   ├── CreateOrderAction.php     ← Single responsibility
│   ├── CopyCartToOrderAction.php
│   ├── UpdateInventoryAction.php
│   └── ProcessPaymentAction.php
├── Events/
│   ├── OrderCreated.php
│   ├── OrderProcessing.php
│   └── PaymentProcessed.php
├── Listeners/
│   ├── SendOrderConfirmation.php
│   ├── UpdateInventoryReport.php
│   └── NotifyAdmin.php
├── Models/
│   ├── Order.php
│   ├── OrderItem.php
│   ├── Payment.php
│   └── ... (others)
└── Http/
    └── Controllers/
        └── OrderController.php
```

### Service Layer Example

```php
// OrderService.php
class OrderService
{
    public function __construct(
        private OrderCalculationService $calculations,
        private InventoryService $inventory,
        private PaymentService $payment,
    ) {}

    public function createOrder(
        Customer $customer,
        Cart $cart,
        Address $shippingAddress,
        string $paymentMethod
    ): Order {
        return DB::transaction(function () use (
            $customer, $cart, $shippingAddress, $paymentMethod
        ) {
            // 1. Validate and lock
            $this->validateAndLock($cart);

            // 2. Create order
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'shipping_address_id' => $shippingAddress->id,
                'status' => 'pending',
                // ... other fields
            ]);

            // 3. Copy cart items → order items & update stock
            foreach ($cart->items as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $cartItem->unit_price,
                    'total_price' => $cartItem->total_price,
                ]);

                // Atomically decrement stock
                $this->inventory->deductStock(
                    $cartItem->product_id,
                    $cartItem->quantity
                );
            }

            // 4. Calculate final totals
            $totals = $this->calculations->calculateOrderTotals($order);
            $order->update($totals);

            // 5. Create payment record
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'amount' => $order->total,
                'status' => 'pending',
            ]);

            // 6. Clear cart
            $cart->delete();

            // Fire event for async jobs
            OrderCreated::dispatch($order);

            return $order;
        });
    }
}
```

---

## Query Optimization Tips

### 1. **Eager Loading**
```php
// Bad
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name; // N+1 query
}

// Good
$orders = Order::with(['customer', 'items', 'payment', 'address'])->get();
```

### 2. **Selective Loading**
```php
$order = Order::select([
    'id', 'order_number', 'customer_id', 'status', 'total'
])
    ->with('customer:id,first_name,last_name')
    ->with('items:id,order_id,product_name,quantity,unit_price')
    ->find($orderId);
```

### 3. **Atomic Operations**
```php
// Don't do this (race condition)
$product->stock_quantity -= $quantity;
$product->save();

// Do this (atomic)
Product::lockForUpdate()
    ->where('id', $productId)
    ->decrement('stock_quantity', $quantity);
```

### 4. **Indexes Priority**
```
1. orders(customer_id, status, created_at)
2. orders(status, created_at) - for admin dashboards
3. order_items(order_id, product_id)
4. products(id) with index for stock
5. payments(order_id, status)
```

---

## Error Handling & Rollback

### Scenarios to Handle

```php
// 1. Stock unavailable
try {
    $this->validateStock($cartItems);
} catch (InsufficientStockException $e) {
    return response()->json(['error' => 'Out of stock: ' . $e->product], 409);
}

// 2. Payment declined (after order created)
try {
    $payment = $this->payment->process($order);
} catch (PaymentFailedException $e) {
    // Order still exists but payment failed
    $order->update(['status' => 'payment_failed']);
    Payment::create([...payment details, 'status' => 'failed']);
}

// 3. Address invalid
try {
    $address->validate();
} catch (InvalidAddressException $e) {
    return response()->json(['error' => 'Invalid address'], 422);
}

// 4. Customer not found
if (!$customer->exists()) {
    throw CustomerNotFoundException::class;
}
```

---

## Summary Table: Operations by Table

| Table | Operation | Timing | Atomicity | Notes |
|-------|-----------|--------|-----------|-------|
| **orders** | INSERT | Early | Critical | Transaction start |
| **order_items** | INSERT | Early | Critical | Snapshot cart |
| **products** | UPDATE | Early | Critical | Lock for consistency |
| **payments** | INSERT | Mid | High | May retry |
| **carts** | DELETE | Late | Low | Can be queued |
| **customers** | READ | Start | N/A | Lookup only |
| **addresses** | READ | Start | N/A | Validation only |
| **product_images** | READ | Display | N/A | For confirmations |

---

## Best Practices Checklist

- ✅ **Transactions:** Wrap entire order creation in DB::transaction()
- ✅ **Locks:** Use lockForUpdate() on products to prevent race conditions
- ✅ **Snapshots:** Store product data in order_items for historical accuracy
- ✅ **Validation:** Validate all data before transaction starts
- ✅ **Error Handling:** Graceful failures with specific error messages
- ✅ **Logging:** Log all steps for debugging (especially stock updates)
- ✅ **Async:** Use events/queues for emails, reports, notifications
- ✅ **Idempotent Payments:** If payment retries, don't double-charge
- ✅ **Status Workflow:** Define clear status transitions (pending → processing → shipped)
- ✅ **Indexes:** Optimize queries on frequently filtered columns

---

## Next Steps

1. **Create OrderService** with all business logic
2. **Implement OrderCalculationService** for tax & totals
3. **Build InventoryService** with atomic operations
4. **Setup Event Listeners** for async tasks
5. **Create comprehensive tests** for race conditions
6. **Document API** for order creation endpoint
