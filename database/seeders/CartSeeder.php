<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CartSeeder extends Seeder
{
	public function run(): void
	{
		$now = now();
		$customers = Customer::pluck('id')->all();
		$products = Product::select('id', 'price')->get();

		for ($i = 0; $i < 5; $i++) {
			$customerId = !empty($customers) ? $customers[array_rand($customers)] : null;
			$currency = 'USD';
			$cart = Cart::create([
				'session_id' => null,
				'customer_id' => $customerId,
				'user_id' => null,
				'currency' => $currency,
				'subtotal' => 0,
				'tax_amount' => 0,
				'discount_amount' => 0,
				'total' => 0,
				'notes' => null,
				'expires_at' => now()->addDays(7),
				'created_at' => $now,
				'updated_at' => $now,
			]);

			$itemsCount = rand(1, 4);
			$subtotal = 0;
			for ($j = 0; $j < $itemsCount; $j++) {
				$product = $products->random();
				$quantity = rand(1, 3);
				$unitPrice = $product->price;
				$totalPrice = $unitPrice * $quantity;

				CartItem::create([
					'cart_id' => $cart->id,
					'product_id' => $product->id,
					'quantity' => $quantity,
					'unit_price' => $unitPrice,
					'total_price' => $totalPrice,
					'product_options' => null,
					'notes' => null,
					'created_at' => $now,
					'updated_at' => $now,
				]);

				$subtotal += $totalPrice;
			}

			$tax = round($subtotal * 0.1, 2);
			$total = $subtotal + $tax;
			$cart->update([
				'subtotal' => $subtotal,
				'tax_amount' => $tax,
				'total' => $total,
				'updated_at' => now(),
			]);
		}
	}
}


