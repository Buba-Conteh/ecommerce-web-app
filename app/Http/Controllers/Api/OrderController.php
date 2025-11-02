<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get user's orders
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

        $orders = Order::with(['items.product.images', 'address'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders,
            'message' => 'Orders retrieved successfully'
        ]);
    }


    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'shipping_address_id' => 'required|exists:addresses,id',
            'billing_address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|string|in:credit_card,paypal,stripe',
            'notes' => 'nullable|string|max:500',
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

        $cart = Cart::with(['items.product'])
            ->where('user_id', $user->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 400);
        }

        // Validate stock availability
        foreach ($cart->items as $item) {
            if ($item->product->track_stock && $item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Insufficient stock for {$item->product->name}"
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'status' => 'pending',
                'subtotal' => $cart->subtotal,
                'tax_amount' => $cart->tax_amount,
                'shipping_amount' => $cart->shipping_amount,
                'discount_amount' => $cart->discount_amount,
                'total' => $cart->total,
                'shipping_address_id' => $request->shipping_address_id,
                'billing_address_id' => $request->billing_address_id,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                ]);

                // Update product stock
                if ($item->product->track_stock) {
                    $item->product->decrement('stock_quantity', $item->quantity);
                }
            }

            // Clear cart
            $cart->items()->delete();
            $this->recalculateCartTotals($cart);

            DB::commit();

            $order->load(['items.product.images', 'address']);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    function userOrders($user): JsonResponse
    {
        $orders = Order::with(['items.product.images', 'address'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $orders,
                'message' => 'Orders retrieved successfully'
            ]);
            
    }
    /**
     * Cancel an order
     */
    public function cancel($id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $order = Order::where('user_id', $user->id)
            ->where('id', $id)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or cannot be cancelled'
            ], 404);
        }

        DB::beginTransaction();
        try {
            // Restore product stock
            foreach ($order->items as $item) {
                if ($item->product->track_stock) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
            }

            $order->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order status
     */
    public function status($id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $order = Order::select('id', 'status', 'tracking_number', 'shipped_at')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
            'message' => 'Order status retrieved successfully'
        ]);
    }

    /**
     * Recalculate cart totals (helper method)
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
