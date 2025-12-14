<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Address;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    protected CartService $cartService;
    protected InventoryService $inventoryService;

    public function __construct(
        CartService $cartService,
        InventoryService $inventoryService
    ) {
        $this->cartService = $cartService;
        $this->inventoryService = $inventoryService;
    }

    /**
     * Create order from cart
     */
    public function createOrderFromCart(
        Cart $cart,
        Customer $customer,
        Address $shippingAddress,
        string $paymentMethod = 'stripe',
        array $additionalData = []
    ): Order {
        return DB::transaction(function () use ($cart, $customer, $shippingAddress, $paymentMethod, $additionalData) {
            // Validate cart has items
            if ($cart->items->isEmpty()) {
                throw new \Exception('Cart is empty');
            }

            // Validate stock availability
            foreach ($cart->items as $cartItem) {
                if (!$this->inventoryService->checkStock($cartItem->product, $cartItem->quantity)) {
                    throw new \Exception("Insufficient stock for product: {$cartItem->product->name}");
                }
            }

            // Generate order number
            $orderNumber = $this->generateOrderNumber();

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'user_id' => $cart->user_id,
                'shipping_address_id' => $shippingAddress->id,
                'status' => 'pending',
                'currency' => $cart->currency ?? 'USD',
                'subtotal' => $cart->subtotal,
                'tax_amount' => $cart->tax_amount,
                'shipping_amount' => $cart->shipping_amount,
                'discount_amount' => $cart->discount_amount ?? 0,
                'total' => $cart->total,
                'payment_method' => $paymentMethod,
                'shipping_method' => $additionalData['shipping_method'] ?? 'standard',
                'notes' => $additionalData['notes'] ?? null,
                'customer_notes' => $additionalData['customer_notes'] ?? null,
            ]);

            // Create order items and update inventory
            foreach ($cart->items as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'total_price' => $cartItem->total_price,
                ]);

                // Update inventory
                $this->inventoryService->decreaseStock($cartItem->product, $cartItem->quantity);
            }

            // Clear cart
            $this->cartService->clearCart($cart);

            return $order->load(['items.product.images', 'customer', 'shippingAddress']);
        });
    }

    /**
     * Update order status
     */
    public function updateStatus(Order $order, string $status, array $additionalData = []): Order
    {
        $updates = ['status' => $status];

        if (isset($additionalData['tracking_number'])) {
            $updates['tracking_number'] = $additionalData['tracking_number'];
        }

        if ($status === 'shipped' && !$order->shipped_at) {
            $updates['shipped_at'] = now();
        }

        if ($status === 'delivered' && !$order->delivered_at) {
            $updates['delivered_at'] = now();
        }

        if ($status === 'cancelled') {
            // Restore inventory
            foreach ($order->items as $item) {
                $this->inventoryService->increaseStock($item->product, $item->quantity);
            }
        }

        $order->update($updates);

        return $order->fresh();
    }

    /**
     * Generate unique order number
     */
    protected function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}

