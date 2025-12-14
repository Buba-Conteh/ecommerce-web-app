<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderRequest $orderRequest)
    {
        if ($orderRequest->save()) {
            $order = $orderRequest->order ?? null;
            
            if (!$order) {
                if (request()->expectsJson() || request()->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order was created but could not be retrieved',
                    ], 500);
                }
                return redirect()->back()->with('error', 'Order was created but could not be retrieved');
            }
            
            // Load relationships for response
            $order->load(['items', 'customer', 'shippingAddress']);
            
            if (request()->expectsJson() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'order' => $order,
                ], 201);
            }
            
            // For Inertia requests, redirect to confirmation page
            // Inertia will handle the redirect and pass the order ID as a query parameter
            return redirect()
                ->route('orders.confirmation', ['order' => $order->id])
                ->with('success', 'Order created successfully');
        }
        
        if (request()->expectsJson() || request()->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'errors' => $orderRequest->errors(),
            ], 422);
        }
        
        return redirect()->back()->with('error', 'Order failed to create');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
