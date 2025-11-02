<?php

namespace App\Application\Orders;

use App\Domain\Order\Entities\CartItemData;
use App\Models\Address;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Product;

class CreateOrderFromGuestCart
{
	/**
	 * @param array{first_name:string,last_name:string,email:string,address_line_1:string,city:string,state:string,postal_code:string,country:string} $customerData
	 * @param CartItemData[] $items
	 */
	public function handle(array $customerData, array $items): Order
	{
		return DB::transaction(function () use ($customerData, $items) {
			$customer = Customer::firstOrCreate(
				['email' => $customerData['email']],
				[
					'first_name' => $customerData['first_name'],
					'last_name' => $customerData['last_name'],
					'is_active' => true,
				]
			);

			$address = Address::create([
				'customer_id' => $customer->id,
				'type' => 'both',
				'first_name' => $customerData['first_name'],
				'last_name' => $customerData['last_name'],
				'address_line_1' => $customerData['address_line_1'],
				'city' => $customerData['city'],
				'state' => $customerData['state'],
				'postal_code' => $customerData['postal_code'],
				'country' => $customerData['country'],
				'is_default' => true,
			]);

			$subtotal = 0.0;
			foreach ($items as $i) {
				$subtotal += $i->unitPrice * $i->quantity;
			}
			$tax = round($subtotal * 0.1, 2);
			$shipping = $subtotal > 100 ? 0 : 9.99;
			$total = $subtotal + $tax + $shipping;

			$order = Order::create([
				'order_number' => 'ORD-' . Str::upper(Str::random(10)),
				'customer_id' => $customer->id,
				'user_id' => null,
				'status' => 'pending',
				'currency' => 'USD',
				'subtotal' => $subtotal,
				'tax_amount' => $tax,
				'shipping_amount' => $shipping,
				'discount_amount' => 0,
				'total' => $total,
				'shipping_method' => 'Standard',
				'payment_method' => 'card',
			]);

			foreach ($items as $i) {
				$product = Product::find($i->productId);
				OrderItem::create([
					'order_id' => $order->id,
					'product_id' => $i->productId,
					'product_name' => $product?->name ?? 'Product',
					'product_sku' => $product?->sku,
					'quantity' => $i->quantity,
					'unit_price' => $i->unitPrice,
					'total_price' => $i->unitPrice * $i->quantity,
				]);
			}

			return $order->load(['items']);
		});
	}
}


