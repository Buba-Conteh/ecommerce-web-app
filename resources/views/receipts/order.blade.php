<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 40px;
        }
        .header {
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 11px;
        }
        .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .info-box {
            flex: 1;
        }
        .info-box h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #000;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-top: 20px;
            margin-left: auto;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .totals-row.total {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 10px 0;
            margin-top: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .status-shipped { background-color: #e9d5ff; color: #6b21a8; }
        .status-delivered { background-color: #d1fae5; color: #065f46; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Receipt</h1>
        <p>Thank you for your purchase!</p>
    </div>

    <div class="order-info">
        <div class="info-box">
            <h3>Order Information</h3>
            <p><strong>Order Number:</strong> {{ $order->order_number }}</p>
            <p><strong>Order Date:</strong> {{ $order->created_at->format('F d, Y h:i A') }}</p>
            <p><strong>Status:</strong> 
                <span class="status-badge status-{{ $order->status }}">
                    {{ ucfirst($order->status) }}
                </span>
            </p>
            <p><strong>Payment Method:</strong> {{ ucfirst(str_replace('_', ' ', $order->payment_method ?? 'N/A')) }}</p>
        </div>

        <div class="info-box">
            <h3>Shipping Address</h3>
            @if($order->shippingAddress)
                <p><strong>{{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }}</strong></p>
                <p>{{ $order->shippingAddress->address_line_1 }}</p>
                @if($order->shippingAddress->address_line_2)
                    <p>{{ $order->shippingAddress->address_line_2 }}</p>
                @endif
                <p>{{ $order->shippingAddress->city }}, {{ $order->shippingAddress->state }} {{ $order->shippingAddress->postal_code }}</p>
                <p>{{ $order->shippingAddress->country }}</p>
                @if($order->shippingAddress->phone)
                    <p><strong>Phone:</strong> {{ $order->shippingAddress->phone }}</p>
                @endif
            @else
                <p>No shipping address provided</p>
            @endif
        </div>

        <div class="info-box">
            <h3>Customer Information</h3>
            @if($order->customer)
                <p><strong>{{ $order->customer->first_name }} {{ $order->customer->last_name }}</strong></p>
                <p>{{ $order->customer->email }}</p>
                @if($order->customer->phone)
                    <p>{{ $order->customer->phone }}</p>
                @endif
            @else
                <p>Guest Customer</p>
            @endif
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product_name ?? $item->product->name ?? 'N/A' }}</strong>
                    </td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">${{ number_format($item->price ?? $item->unit_price ?? 0, 2) }}</td>
                    <td class="text-right">${{ number_format($item->total_price ?? ($item->quantity * ($item->price ?? $item->unit_price ?? 0)), 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Subtotal:</span>
            <span>${{ number_format($order->subtotal, 2) }}</span>
        </div>
        @if($order->tax_amount > 0)
        <div class="totals-row">
            <span>Tax:</span>
            <span>${{ number_format($order->tax_amount, 2) }}</span>
        </div>
        @endif
        @if($order->shipping_amount > 0)
        <div class="totals-row">
            <span>Shipping:</span>
            <span>${{ number_format($order->shipping_amount, 2) }}</span>
        </div>
        @else
        <div class="totals-row">
            <span>Shipping:</span>
            <span>Free</span>
        </div>
        @endif
        @if($order->discount_amount > 0)
        <div class="totals-row">
            <span>Discount:</span>
            <span>-${{ number_format($order->discount_amount, 2) }}</span>
        </div>
        @endif
        <div class="totals-row total">
            <span>Total:</span>
            <span>${{ number_format($order->total, 2) }}</span>
        </div>
    </div>

    @if($order->notes)
    <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #000;">
        <strong>Order Notes:</strong>
        <p style="margin-top: 5px;">{{ $order->notes }}</p>
    </div>
    @endif

    <div class="footer">
        <p>This is an official receipt for your order. Please keep this for your records.</p>
        <p style="margin-top: 10px;">For questions or support, please contact our customer service.</p>
        <p style="margin-top: 5px;">Generated on {{ now()->format('F d, Y h:i A') }}</p>
    </div>
</body>
</html>

