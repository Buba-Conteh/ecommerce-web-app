<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    function profile() {
        $orders = [];
        // dd(Auth::user());
        if ($user = 1) {
            $ordersData = Order::with(['items.product.images'])
                ->where('user_id', $user)
                ->orderBy('created_at', 'desc')
                ->get();
    
                
                // ->map(function ($order) {
                //     return [
                //         'id' => $order->order_number ?? $order->id,
                //         'order_id' => $order->id,
                //         'order_number' => $order->order_number,
                //         'created_at' => $order->created_at->toIso8601String(),
                //         'status' => $order->status,
                //         'total' => (float) $order->total,
                //         'subtotal' => (float) $order->subtotal,
                //         'tax_amount' => (float) $order->tax_amount,
                //         'shipping_amount' => (float) $order->shipping_amount,
                //         'items' => $order->items->map(function ($item) {
                //             return [
                //                 'id' => $item->id,
                //                 'product_id' => $item->product_id,
                //                 'name' => $item->product->name ?? 'Unknown Product',
                //                 'quantity' => $item->quantity,
                //                 'price' => (float) $item->price,
                //                 'total' => (float) $item->total,
                //                 'image' => $item->product->images->firstWhere('is_primary', true)?->url 
                //                     ?? $item->product->images->first()?->url 
                //                     ?? '/placeholder.svg',
                //             ];
                //         }),
                //     ];
                // });
            
            $orders = $ordersData->toArray();
            return Inertia::render('profile/page', [
                'orders' => $orders,
            ]);
        }
    }
}
