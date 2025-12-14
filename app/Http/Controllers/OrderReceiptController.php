<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class OrderReceiptController extends Controller
{
    /**
     * Generate and download PDF receipt for an order
     */
    public function download(Order $order)
    {
        $order->load([
            'customer',
            'items.product.images',
            'shippingAddress',
            'payments',
        ]);

        $pdf = Pdf::loadView('receipts.order', [
            'order' => $order,
        ]);

        return $pdf->download("receipt-{$order->order_number}.pdf");
    }

    /**
     * View PDF receipt in browser
     */
    public function view(Order $order)
    {
        $order->load([
            'customer',
            'items.product.images',
            'shippingAddress',
            'payments',
        ]);

        $pdf = Pdf::loadView('receipts.order', [
            'order' => $order,
        ]);

        return $pdf->stream("receipt-{$order->order_number}.pdf");
    }
}

