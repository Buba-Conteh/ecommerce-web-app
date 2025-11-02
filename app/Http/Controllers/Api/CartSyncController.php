<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CartSyncController extends Controller
{
	public function store(Request $request): JsonResponse
	{
		$user = Auth::user();
		if (!$user) {
			return response()->json(['message' => 'Unauthorized'], 401);
		}

		$validated = $request->validate([
			'items' => ['required', 'array'],
			'items.*.id' => ['required', 'integer', 'exists:products,id'],
			'items.*.quantity' => ['required', 'integer', 'min:1'],
		]);

		$cart = Cart::firstOrCreate(['user_id' => $user->id], [
			'currency' => 'USD',
			'subtotal' => 0,
			'tax_amount' => 0,
			'discount_amount' => 0,
			'total' => 0,
		]);

		// Replace items
		CartItem::where('cart_id', $cart->id)->delete();

		$subtotal = 0;
		foreach ($validated['items'] as $i) {
			$product = Product::find($i['id']);
			$quantity = (int) $i['quantity'];
			$unit = $product?->price ?? 0;
			CartItem::create([
				'cart_id' => $cart->id,
				'product_id' => $product->id,
				'quantity' => $quantity,
				'unit_price' => $unit,
				'total_price' => $unit * $quantity,
			]);
			$subtotal += $unit * $quantity;
		}

		$tax = round($subtotal * 0.1, 2);
		$total = $subtotal + $tax;
		$cart->update(['subtotal' => $subtotal, 'tax_amount' => $tax, 'total' => $total]);

		return response()->json(['success' => true, 'cart' => $cart->load('items.product')]);
	}
}


