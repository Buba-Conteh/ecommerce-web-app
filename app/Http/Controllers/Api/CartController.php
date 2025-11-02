<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get the user's cart
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $cart = Cart::with(['items.product.images', 'items.product.category'])
            ->where('user_id', $user->id)
            ->first();

        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $user->id,
                'total' => 0,
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $cart,
            'message' => 'Cart retrieved successfully'
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $product = Product::findOrFail($request->product_id);
        
        // Check stock availability
        if ($product->track_stock && $product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $cart = Cart::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'total' => 0,
                    'subtotal' => 0,
                    'tax_amount' => 0,
                    'shipping_amount' => 0,
                    'discount_amount' => 0
                ]
            );

            // Check if item already exists in cart
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($cartItem) {
                // Update quantity
                $cartItem->update([
                    'quantity' => $cartItem->quantity + $request->quantity
                ]);
            } else {
                // Create new cart item
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity,
                    'price' => $product->price,
                    'total' => $product->price * $request->quantity
                ]);
            }

            // Recalculate cart totals
            $this->recalculateCartTotals($cart);

            DB::commit();

            $cart->load(['items.product.images', 'items.product.category']);

            return response()->json([
                'success' => true,
                'data' => $cart,
                'message' => 'Item added to cart successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, $itemId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $cartItem = CartItem::whereHas('cart', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($itemId);

        $product = $cartItem->product;
        
        // Check stock availability
        if ($product->track_stock && $product->stock_quantity < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $cartItem->update([
                'quantity' => $request->quantity,
                'total' => $product->price * $request->quantity
            ]);

            // Recalculate cart totals
            $this->recalculateCartTotals($cartItem->cart);

            DB::commit();

            $cart = $cartItem->cart->load(['items.product.images', 'items.product.category']);

            return response()->json([
                'success' => true,
                'data' => $cart,
                'message' => 'Cart item updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem($itemId): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $cartItem = CartItem::whereHas('cart', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($itemId);

        DB::beginTransaction();
        try {
            $cart = $cartItem->cart;
            $cartItem->delete();

            // Recalculate cart totals
            $this->recalculateCartTotals($cart);

            DB::commit();

            $cart->load(['items.product.images', 'items.product.category']);

            return response()->json([
                'success' => true,
                'data' => $cart,
                'message' => 'Item removed from cart successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear the entire cart
     */
    public function clear(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        
        if ($cart) {
            $cart->items()->delete();
            $this->recalculateCartTotals($cart);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
    }

    /**
     * Recalculate cart totals
     */
    private function recalculateCartTotals(Cart $cart): void
    {
        $subtotal = $cart->items->sum('total');
        $taxAmount = $subtotal * 0.1; // 10% tax rate
        $shippingAmount = $subtotal > 100 ? 0 : 10; // Free shipping over $100
        $total = $subtotal + $taxAmount + $shippingAmount;

        $cart->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingAmount,
            'total' => $total
        ]);
    }
}
