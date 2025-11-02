<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Payment Controller using Laravel Cashier
 * 
 * NOTE: Cashier is designed for subscriptions and billable models (Users).
 * For one-time e-commerce payments, direct Stripe integration is recommended.
 * This controller demonstrates Cashier usage but may not be ideal for your use case.
 */
class CashierPaymentController extends Controller
{
    /**
     * Create a one-time charge using Cashier
     * 
     * Requires User model to have Billable trait:
     * use Laravel\Cashier\Billable;
     * 
     * Then in User model:
     * use Billable;
     */
    public function charge(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method_id' => 'required|string', // Stripe Payment Method ID
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $user = $order->user ?? auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User authentication required for Cashier',
            ], 401);
        }

        try {
            // Charge using Cashier (requires User to have Billable trait)
            $charge = $user->charge(
                (int)($order->total * 100), // Amount in cents
                $validated['payment_method_id'],
                [
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                    ],
                ]
            );

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'card',
                'transaction_id' => $charge->id,
                'payment_gateway' => 'stripe',
                'status' => 'completed',
                'amount' => $order->total,
                'currency' => $order->currency ?? 'USD',
                'payment_data' => json_encode($charge->toArray()),
                'processed_at' => now(),
            ]);

            // Update order status
            $order->update([
                'status' => 'confirmed',
                'payment_method' => 'card',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'charge' => $charge,
                'order' => $order->fresh(['items.product.images']),
            ]);

        } catch (\Laravel\Cashier\Exceptions\IncompletePayment $e) {
            // Payment requires additional action (e.g., 3D Secure)
            Log::warning('Payment requires additional action', [
                'order_id' => $order->id,
                'payment' => $e->payment,
            ]);

            return response()->json([
                'success' => false,
                'requires_action' => true,
                'payment_intent' => [
                    'id' => $e->payment->id,
                    'client_secret' => $e->payment->client_secret,
                    'status' => $e->payment->status,
                ],
                'message' => 'Payment requires additional verification',
            ], 402);

        } catch (\Exception $e) {
            Log::error('Cashier payment failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a payment intent (for frontend payment confirmation)
     * 
     * Cashier can also create payment intents directly
     */
    public function createIntent(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.50',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $user = $order->user ?? auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User authentication required',
            ], 401);
        }

        try {
            // Create payment intent using Cashier
            $intent = $user->createSetupIntent([
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ],
            ]);

            // For one-time payment, use charge method instead
            // This is a workaround - Cashier is designed for subscriptions
            $paymentIntent = \Stripe\PaymentIntent::create([
                'amount' => (int)($validated['amount'] * 100),
                'currency' => strtolower($order->currency ?? 'usd'),
                'customer' => $user->stripe_id ?? null,
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'card',
                'transaction_id' => $paymentIntent->id,
                'payment_gateway' => 'stripe',
                'status' => 'pending',
                'amount' => $validated['amount'],
                'currency' => $order->currency ?? 'USD',
                'payment_data' => json_encode(['client_secret' => $paymentIntent->client_secret]),
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $paymentIntent->client_secret,
                'payment_id' => $payment->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Cashier payment intent creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook (Cashier webhook handler)
     * 
     * Cashier provides a built-in webhook controller:
     * Route::post('/stripe/webhook', \Laravel\Cashier\Http\Controllers\WebhookController::class)
     */
    public function webhook(Request $request)
    {
        // Cashier handles webhooks automatically
        // You can extend it here if needed
        
        // For order payments, you may want to listen to payment_intent.succeeded
        // and update your Order model accordingly
        
        return response()->json(['received' => true]);
    }
}

