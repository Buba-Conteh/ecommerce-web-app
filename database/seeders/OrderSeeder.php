<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
	public function run(): void
	{
		$now = now();
		$customers = Customer::pluck('id')->all();
		$products = Product::select('id', 'name', 'sku', 'price')->get();

		$statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
		for ($i = 0; $i < 8; $i++) {
			$customerId = $customers[array_rand($customers)];
			$order = Order::create([
				'order_number' => 'ORD-' . Str::upper(Str::random(10)),
				'customer_id' => $customerId,
				'user_id' => null,
				'status' => $statuses[array_rand($statuses)],
				'currency' => 'USD',
				'subtotal' => 0,
				'tax_amount' => 0,
				'shipping_amount' => 0,
				'discount_amount' => 0,
				'total' => 0,
				'notes' => null,
				'customer_notes' => null,
				'shipping_method' => 'Standard',
				'payment_method' => 'card',
				'tracking_number' => null,
				'shipped_at' => null,
				'delivered_at' => null,
				'created_at' => $now,
				'updated_at' => $now,
			]);

			$itemsCount = rand(1, 5);
			$subtotal = 0;
			for ($j = 0; $j < $itemsCount; $j++) {
				$product = $products->random();
				$quantity = rand(1, 3);
				$unitPrice = $product->price;
				$totalPrice = $unitPrice * $quantity;

				OrderItem::create([
					'order_id' => $order->id,
					'product_id' => $product->id,
					'product_name' => $product->name,
					'product_sku' => $product->sku,
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
			$shipping = $subtotal > 200 ? 0 : 9.99;
			$total = $subtotal + $tax + $shipping;
			$order->update([
				'subtotal' => $subtotal,
				'tax_amount' => $tax,
				'shipping_amount' => $shipping,
				'total' => $total,
				'updated_at' => now(),
			]);

			// Payment
			Payment::create([
				'order_id' => $order->id,
				'payment_method' => 'card',
				'transaction_id' => 'TX-' . Str::upper(Str::random(12)),
				'payment_gateway' => 'stripe',
				'status' => 'completed',
				'amount' => $total,
				'currency' => 'USD',
				'payment_data' => null,
				'notes' => null,
				'processed_at' => $now,
				'created_at' => $now,
				'updated_at' => $now,
			]);
		}
	}
}


