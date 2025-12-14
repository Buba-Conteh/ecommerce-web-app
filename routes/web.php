<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Api\OrderController as ApiOrderController;
use App\Http\Controllers\OrderReceiptController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PayPalController;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Health check endpoint for monitoring
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
    ]);
});

Route::get('/', function () {
    // Get featured products for the homepage
    $featuredProducts = Product::with(['category', 'brand', 'images'])
        ->active()
        ->featured()
        ->limit(6)
        ->get();

    return Inertia::render('welcome', [
        'featuredProducts' => $featuredProducts
    ]);
})->name('home');

// E-commerce routes
Route::get('/cart', function () {
    // Cart is now managed by CartProvider on the frontend
    // No need to pass cart data from backend
    return Inertia::render('cart/page');
})->name('cart');

Route::get('/orders', function () {
    return Inertia::render('orders/page');
})->name('orders');

Route::get('/orders/confirmation', function () {
    $orderId = request()->query('order');
    $order = null;
    
    if ($orderId) {
        $order = \App\Models\Order::with(['items', 'customer', 'shippingAddress'])
            ->find($orderId);
    }
    
    return Inertia::render('orders/confirmation', [
        'order' => $order,
    ]);
})->name('orders.confirmation');

Route::get('/checkout', function () {
    $user = Auth::user();
    $customer = null;
    $addresses = [];
    
    if ($user && $user->customer) {
        $customer = $user->customer;
        $addresses = $customer->addresses()->get();
    }
    
    return Inertia::render('checkout/page', [
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'customer' => $customer ? [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'addresses' => $addresses,
            ] : null,
        ] : null,
    ]);
})->name('checkout');

Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');

Route::prefix('/user')->middleware(['auth'])->group(function (){
    Route::get('profile/', [UserProfileController::class, 'profile']);
} );

Route::get('/products', [ProductsController::class, 'index'])->name('products.index');

Route::get('/products/{id}', function ($id) {
    return Inertia::render('products/[id]/page', [
        'id' => $id
    ]);
})->name('products.show');

// Test route to verify Inertia is working
Route::get('/test', function () {
    return Inertia::render('welcome');
})->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin routes
Route::prefix('/admin')->middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard/page');
    })->name('admin.dashboard');
    
    // Products routes
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');

    Route::controller(AdminProductController::class)->group(function () {
        Route::get('/products', 'index')->name('admin.products');
         Route::post('/products', 'store')->name('admin.products.store');
        Route::get('/products/{product}/edit', 'edit')->name('admin.products.edit');
        Route::get('/products/{product}', 'show')->name('admin.products.view');
        Route::put('/products/{product}', 'update')->name('admin.products');
        Route::delete('/products/{product}', 'delete')->name('admin.products.delete');
        Route::post('/products/{product}/restore', 'restore')->name('admin.products.restore');
    });
    
    // Inventory
    Route::controller(\App\Http\Controllers\Admin\InventoryController::class)->group(function () {
        Route::get('/inventory', 'index')->name('admin.inventory');
        Route::put('/inventory/{product}/stock', 'updateStock')->name('admin.inventory.update-stock');
    });
    
    // Customers
    Route::controller(CustomerController::class)->group(function () {
        Route::get('/customers', 'index')->name('admin.customers');
        //  Route::post('/customers', 'store')->name('admin.customers.store');
        // Route::get('/customers/{product}/edit', 'edit')->name('admin.customers.edit');
        // Route::get('/customers/{product}', 'show')->name('admin.customers.view');
        // Route::put('/customers/{product}', 'update')->name('admin.customers');
        // Route::delete('/customers/{product}', 'delete')->name('admin.customers.delete');
        // Route::post('/customers/{product}/restore', 'restore')->name('admin.customers.restore');
    });
    // Route::get('/customers', function () {
    //     return Inertia::render('admin/customers/page');
    // })->name('admin.customers');
    
    // Orders
    Route::controller(\App\Http\Controllers\Admin\OrderController::class)->group(function () {
        Route::get('/orders', 'index')->name('admin.orders');
        Route::get('/orders/{order}', 'show')->name('admin.orders.show');
        Route::put('/orders/{order}/status', 'updateStatus')->name('admin.orders.update-status');
    });
    
    // Analytics
    Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('admin.analytics');
    
    // Settings
    Route::get('/settings', function () {
        return Inertia::render('admin/settings/page');
    })->name('admin.settings');
});

// Admin API routes
// Route::prefix('/api/admin')->middleware(['auth'])->group(function () {
//     Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
// });
// Checkout now handles order creation via /checkout POST route
// Keeping this for backward compatibility if needed
// Route::prefix('orders')->group(function () {
//     Route::post('/', [OrderController::class, 'store'])->name('orders.store');
// });

// Order Receipt Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/orders/{order}/receipt/download', [OrderReceiptController::class, 'download'])->name('orders.receipt.download');
    Route::get('/orders/{order}/receipt/view', [OrderReceiptController::class, 'view'])->name('orders.receipt.view');
});
// Payment routes
Route::prefix('/api/payments')->middleware(['auth'])->group(function () {
    // Stripe routes
    Route::post('/stripe/create-intent', [PaymentController::class, 'createIntent'])->name('payments.stripe.create');
    Route::post('/stripe/confirm', [PaymentController::class, 'confirm'])->name('payments.stripe.confirm');
    Route::post('/stripe/webhook', [PaymentController::class, 'webhook'])->name('payments.stripe.webhook');
    
    // PayPal routes
    Route::post('/paypal/create-order', [PayPalController::class, 'createOrder'])->name('payments.paypal.create');
    Route::post('/paypal/capture', [PayPalController::class, 'capture'])->name('payments.paypal.capture');
});

// PayPal callback routes (no auth required)
Route::get('/paypal/success', [PayPalController::class, 'success'])->name('paypal.success');
Route::get('/paypal/cancel', [PayPalController::class, 'cancel'])->name('paypal.cancel');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
// Include debug routes (optional) — enables /debug/* endpoints for testing Cloudinary
if (file_exists(__DIR__.'/debug.php')) {
    require __DIR__.'/debug.php';
}
