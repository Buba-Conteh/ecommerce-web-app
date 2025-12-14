# PDF Receipt Generation Setup

## Installation

To enable PDF receipt generation, you need to install the Laravel DomPDF package:

```bash
composer require barryvdh/laravel-dompdf
```

## Configuration

After installation, publish the configuration file (optional):

```bash
php artisan vendor:publish --provider="Barryvdh\DomPDF\ServiceProvider"
```

## Usage

The PDF receipt system is already integrated into the order flow:

1. **Download Receipt**: After placing an order, customers can download their receipt as PDF
2. **View Receipt**: Receipts can be viewed in the browser
3. **Routes**: 
   - `/orders/{order}/receipt/download` - Download PDF
   - `/orders/{order}/receipt/view` - View PDF in browser

## Features

- Professional receipt layout
- Order details, items, and totals
- Customer and shipping information
- Order status and payment method
- Automatically generated on order confirmation

## Customization

The receipt template is located at:
- `resources/views/receipts/order.blade.php`

You can customize the styling and layout as needed.

