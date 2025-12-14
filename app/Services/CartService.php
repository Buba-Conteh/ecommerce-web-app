<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartService
{
    /**
     * Get or create cart for authenticated user
     */
    public function getOrCreateCart($userId): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $userId],
            [
                'total' => 0,
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0,
                'currency' => 'USD'
            ]
        );
    }

    /**
     * Add item to cart
     */
    public function addItem(Cart $cart, Product $product, int $quantity): CartItem
    {
        // Check stock availability
        if ($product->track_stock && $product->stock_quantity < $quantity) {
            throw new \Exception('Insufficient stock available');
        }

        // Check if item already exists in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            // Update quantity
            $cartItem->update([
                'quantity' => $cartItem->quantity + $quantity,
                'total_price' => $product->price * ($cartItem->quantity + $quantity)
            ]);
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $product->price,
                'total_price' => $product->price * $quantity
            ]);
        }

        $this->recalculateTotals($cart);

        return $cartItem->fresh(['product.images', 'product.category']);
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(CartItem $cartItem, int $quantity): CartItem
    {
        $product = $cartItem->product;
        
        // Check stock availability
        if ($product->track_stock && $product->stock_quantity < $quantity) {
            throw new \Exception('Insufficient stock available');
        }

        $cartItem->update([
            'quantity' => $quantity,
            'total_price' => $product->price * $quantity
        ]);

        $this->recalculateTotals($cartItem->cart);

        return $cartItem->fresh(['product.images', 'product.category']);
    }

    /**
     * Remove item from cart
     */
    public function removeItem(CartItem $cartItem): bool
    {
        $cart = $cartItem->cart;
        $cartItem->delete();
        $this->recalculateTotals($cart);
        return true;
    }

    /**
     * Clear cart
     */
    public function clearCart(Cart $cart): bool
    {
        $cart->items()->delete();
        $this->recalculateTotals($cart);
        return true;
    }

    /**
     * Recalculate cart totals
     */
    public function recalculateTotals(Cart $cart): Cart
    {
        $subtotal = $cart->items->sum('total_price');
        $taxRate = 0.10; // 10% tax rate - should come from settings
        $taxAmount = $subtotal * $taxRate;
        $shippingAmount = $subtotal > 100 ? 0 : 10; // Free shipping over $100
        $total = $subtotal + $taxAmount + $shippingAmount - ($cart->discount_amount ?? 0);

        $cart->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'total' => $total
        ]);

        return $cart->fresh();
    }
}

