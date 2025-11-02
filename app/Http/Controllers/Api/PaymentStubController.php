<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;

class PaymentStubController extends Controller
{
	public function pay(int $orderId): JsonResponse
	{
		$order = Order::findOrFail($orderId);
		Payment::create([
			'order_id' => $order->id,
			'payment_method' => 'stub',
			'transaction_id' => 'TEST-' . uniqid(),
			'payment_gateway' => 'stub',
			'status' => 'completed',
			'amount' => $order->total,
			'currency' => 'USD',
		]);
		$order->refresh();
		return response()->json(['success' => true, 'paid' => true, 'order' => $order->load('payments')]);
	}
}


