<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Note: Install stripe/stripe-php package to use these classes
// composer require stripe/stripe-php
// use Stripe\Stripe;
// use Stripe\PaymentIntent;
// use Stripe\Exception\ApiErrorException;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Initialize Stripe with your secret key from config
        // Stripe::setApiKey(config('services.stripe.secret'));
        // TODO: Uncomment after installing stripe/stripe-php
    }

    /**
     * Create a Stripe payment intent for an order
     */
    public function createIntent(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.50',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        try {
            // Create payment intent
            // TODO: Install stripe/stripe-php and uncomment
            /*
            $intent = PaymentIntent::create([
                'amount' => (int)($validated['amount'] * 100), // Convert to cents
                'currency' => strtolower($order->currency ?? 'usd'),
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);
            */
            
            // Placeholder for now
            $intent = (object) [
                'id' => 'pi_' . uniqid(),
                'client_secret' => 'pi_' . uniqid() . '_secret_' . uniqid(),
            ];

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'card',
                'transaction_id' => $intent->id,
                'payment_gateway' => 'stripe',
                'status' => 'pending',
                'amount' => $validated['amount'],
                'currency' => $order->currency ?? 'USD',
                'payment_data' => json_encode(['client_secret' => $intent->client_secret]),
            ]);

            return response()->json([
                'success' => true,
                'client_secret' => $intent->client_secret,
                'payment_id' => $payment->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe payment intent creation failed', [
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
     * Confirm and finalize a Stripe payment
     */
    public function confirm(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => 'required|string',
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        $payment = Payment::where('transaction_id', $validated['payment_intent_id'])
            ->where('order_id', $order->id)
            ->firstOrFail();

        try {
            // Retrieve the payment intent
            // TODO: Uncomment after installing stripe/stripe-php
            // $intent = PaymentIntent::retrieve($validated['payment_intent_id']);
            
            // Placeholder for now
            $intent = (object) [
                'status' => 'succeeded',
                'toArray' => fn() => [],
            ];

            if ($intent->status === 'succeeded') {
                DB::transaction(function () use ($payment, $order, $intent) {
                    // Update payment status
                    $payment->update([
                        'status' => 'completed',
                        'processed_at' => now(),
                        'payment_data' => json_encode($intent->toArray()),
                    ]);

                    // Update order status
                    $order->update([
                        'status' => 'confirmed',
                        'payment_method' => 'card',
                    ]);
                });

                return response()->json([
                    'success' => true,
                    'message' => 'Payment confirmed successfully',
                    'order' => $order->fresh(['items.product.images']),
                ]);
            } else {
                // Payment failed or incomplete
                $payment->update([
                    'status' => 'failed',
                    'payment_data' => json_encode($intent->toArray()),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment was not successful. Please try again.',
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Stripe payment confirmation failed', [
                'payment_intent_id' => $validated['payment_intent_id'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Stripe webhook
     */
    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            // TODO: Uncomment after installing stripe/stripe-php
            // $event = \Stripe\Webhook::constructEvent(
            //     $payload,
            //     $sigHeader,
            //     $endpointSecret
            // );
            
            // Placeholder for now
            $event = (object) [
                'type' => 'payment_intent.succeeded',
                'data' => (object) ['object' => (object) []],
            ];
        } catch (\Exception $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentSuccess($paymentIntent);
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $this->handlePaymentFailure($paymentIntent);
                break;

            default:
                Log::info('Received unknown Stripe event', ['type' => $event->type]);
        }

        return response()->json(['received' => true]);
    }

    protected function handlePaymentSuccess($paymentIntent)
    {
        $orderId = $paymentIntent->metadata->order_id ?? null;
        if (!$orderId) {
            return;
        }

        DB::transaction(function () use ($orderId, $paymentIntent) {
            $payment = Payment::where('transaction_id', $paymentIntent->id)->first();
            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'processed_at' => now(),
                    'payment_data' => json_encode($paymentIntent),
                ]);

                $order = Order::find($orderId);
                if ($order) {
                    $order->update(['status' => 'confirmed']);
                }
            }
        });
    }

    protected function handlePaymentFailure($paymentIntent)
    {
        $payment = Payment::where('transaction_id', $paymentIntent->id)->first();
        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'payment_data' => json_encode($paymentIntent),
            ]);
        }
    }
}

