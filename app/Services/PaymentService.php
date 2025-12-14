<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Create payment record
     */
    public function createPayment(
        Order $order,
        string $method,
        float $amount,
        string $status = 'pending',
        array $metadata = []
    ): Payment {
        return Payment::create([
            'order_id' => $order->id,
            'payment_method' => $method,
            'amount' => $amount,
            'status' => $status,
            'transaction_id' => $metadata['transaction_id'] ?? null,
            'gateway_response' => $metadata['gateway_response'] ?? null,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Payment $payment, string $status, array $metadata = []): Payment
    {
        $updates = ['status' => $status];

        if (isset($metadata['transaction_id'])) {
            $updates['transaction_id'] = $metadata['transaction_id'];
        }

        if (isset($metadata['gateway_response'])) {
            $updates['gateway_response'] = $metadata['gateway_response'];
        }

        if (isset($metadata['metadata'])) {
            $updates['metadata'] = array_merge($payment->metadata ?? [], $metadata['metadata']);
        }

        $payment->update($updates);

        // If payment is completed, update order status
        if ($status === 'completed') {
            $payment->order->update(['status' => 'processing']);
        }

        return $payment->fresh();
    }

    /**
     * Check if order is fully paid
     */
    public function isOrderFullyPaid(Order $order): bool
    {
        $totalPaid = $order->payments()
            ->where('status', 'completed')
            ->sum('amount');

        return $totalPaid >= $order->total;
    }
}

