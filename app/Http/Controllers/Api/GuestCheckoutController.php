<?php

namespace App\Http\Controllers\Api;

use App\Application\Orders\CreateOrderFromGuestCart;
use App\Domain\Order\Entities\CartItemData;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GuestCheckoutController extends Controller
{
	public function __construct(private readonly CreateOrderFromGuestCart $createOrder)
	{
	}

	public function store(Request $request): JsonResponse
	{
		$validated = $request->validate([
			'customer.first_name' => ['required', 'string', 'max:255'],
			'customer.last_name' => ['required', 'string', 'max:255'],
			'customer.email' => ['required', 'email', 'max:255'],
			'customer.address_line_1' => ['required', 'string', 'max:255'],
			'customer.city' => ['required', 'string', 'max:255'],
			'customer.state' => ['required', 'string', 'max:255'],
			'customer.postal_code' => ['required', 'string', 'max:50'],
			'customer.country' => ['required', 'string', 'max:100'],
			'items' => ['required', 'array', 'min:1'],
			'items.*.id' => ['required', 'integer', 'exists:products,id'],
			'items.*.quantity' => ['required', 'integer', 'min:1'],
			'items.*.price' => ['required', 'numeric', 'min:0'],
		]);

		$items = array_map(function ($i) {
			return new CartItemData((int) $i['id'], (int) $i['quantity'], (float) $i['price']);
		}, $validated['items']);

		$order = $this->createOrder->handle($validated['customer'], $items);

		return response()->json([
			'success' => true,
			'order' => $order->toArray(),
		], 201);
	}
}


