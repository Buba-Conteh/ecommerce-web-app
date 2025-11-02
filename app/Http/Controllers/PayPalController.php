<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayPalController extends Controller
{
    private $clientId;
    private $clientSecret;
    private $apiUrl;
    private $accessToken;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
        $this->apiUrl = config('services.paypal.sandbox') 
            ? 'https://api.sandbox.paypal.com' 
            : 'https://api.paypal.com';
        
        $this->accessToken = $this->getAccessToken();
    }

    /**
     * Get PayPal access token
     */
    private function getAccessToken()
    {
        $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
            ->asForm()
            ->post($this->apiUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        Log::error('Failed to get PayPal access token');
        return null;
    }

    /**
     * Create a PayPal order
     */
    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:1',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $paypalOrder = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'reference_id' => $order->order_number,
                    'description' => 'Order ' . $order->order_number,
                    'amount' => [
                        'currency_code' => strtoupper($order->currency ?? 'USD'),
                        'value' => number_format($validated['amount'], 2, '.', ''),
                    ],
                ],
            ],
            'application_context' => [
                'brand_name' => config('app.name'),
                'landing_page' => 'NO_PREFERENCE',
                'user_action' => 'PAY_NOW',
                'return_url' => route('paypal.success'),
                'cancel_url' => route('paypal.cancel'),
            ],
        ];

        $response = Http::withToken($this->accessToken)
            ->acceptJson()
            ->post($this->apiUrl . '/v2/checkout/orders', $paypalOrder);

        if ($response->successful()) {
            $data = $response->json();

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'paypal',
                'transaction_id' => $data['id'],
                'payment_gateway' => 'paypal',
                'status' => 'pending',
                'amount' => $validated['amount'],
                'currency' => $order->currency ?? 'USD',
                'payment_data' => json_encode($data),
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $data['id'],
                'paypal_order_id' => $data['id'],
                'links' => $data['links'],
            ]);
        }

        Log::error('Failed to create PayPal order', [
            'order_id' => $order->id,
            'response' => $response->body(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to create PayPal order',
        ], 500);
    }

    /**
     * Capture PayPal payment
     */
    public function capture(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'paypal_order_id' => 'required|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $response = Http::withToken($this->accessToken)
            ->acceptJson()
            ->post($this->apiUrl . '/v2/checkout/orders/' . $validated['paypal_order_id'] . '/capture');

        if ($response->successful()) {
            $data = $response->json();
            
            if ($data['status'] === 'COMPLETED') {
                DB::transaction(function () use ($order, $data, $validated) {
                    // Find and update payment
                    $payment = Payment::where('transaction_id', $validated['paypal_order_id'])
                        ->where('order_id', $order->id)
                        ->first();

                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'processed_at' => now(),
                            'payment_data' => json_encode($data),
                        ]);
                    }

                    // Update order status
                    $order->update([
                        'status' => 'confirmed',
                        'payment_method' => 'paypal',
                    ]);
                });

                return response()->json([
                    'success' => true,
                    'message' => 'Payment captured successfully',
                    'order' => $order->fresh(['items.product.images']),
                ]);
            }
        }

        Log::error('Failed to capture PayPal payment', [
            'paypal_order_id' => $validated['paypal_order_id'],
            'response' => $response->body(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to capture payment',
        ], 400);
    }

    /**
     * Success page after PayPal payment
     */
    public function success(Request $request)
    {
        $token = $request->query('token');
        
        if (!$token) {
            return redirect('/checkout')->with('error', 'Invalid payment token');
        }

        // Find payment by PayPal order ID
        $payment = Payment::where('transaction_id', $token)->first();
        
        if ($payment && $payment->status === 'completed') {
            return redirect('/orders/' . $payment->order_id)
                ->with('success', 'Payment completed successfully!');
        }

        return redirect('/checkout')->with('error', 'Payment was not completed');
    }

    /**
     * Cancel page after PayPal payment cancellation
     */
    public function cancel(Request $request)
    {
        return redirect('/checkout')->with('error', 'Payment was cancelled');
    }
}

