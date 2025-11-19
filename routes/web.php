<?php

use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
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
    // Get user's cart data
    $user = \Illuminate\Support\Facades\Auth::user();
    $cart = null;
    
    if ($user) {
        $cart = \App\Models\Cart::with(['items.product.images', 'items.product.category'])
            ->where('user_id', $user->id)
            ->first();
            
        if (!$cart) {
            $cart = \App\Models\Cart::create([
                'user_id' => $user->id,
                'total' => 0,
                'subtotal' => 0,
                'tax_amount' => 0,
                'shipping_amount' => 0,
                'discount_amount' => 0
            ]);
        }
    }

    return Inertia::render('cart/page', [
        'cart' => $cart
    ]);
})->name('cart');

Route::get('/orders', function () {
    return Inertia::render('orders/page');
})->name('orders');

Route::get('/checkout', function () {
    return Inertia::render('checkout/page');
})->name('checkout');

Route::prefix('/user')->middleware(['auth'])->group(function (){
    Route::get('profile/', [UserProfileController::class, 'profile']);
} );

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
    Route::get('/', function () {
        return Inertia::render('admin/dashboard/page');
    })->name('admin.dashboard');
    
    // Products routes
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
    Route::controller(AdminProductController::class)->group(function () {
        Route::get('/products', 'index')->name('admin.products');
        Route::get('/products/{product}/edit', 'edit')->name('admin.products.edit');
        Route::get('/products/{product}', 'show')->name('admin.products.view');
        Route::put('/products/{product}', 'update')->name('admin.products.update');
        Route::delete('/products/{product}', 'delete')->name('admin.products.delete');
        Route::post('/products/{product}/restore', 'restore')->name('admin.products.restore');
    });
    
    // Inventory
    Route::get('/inventory', function () {
        return Inertia::render('admin/products/page'); // Use products page for now
    })->name('admin.inventory');
    
    // Customers
    Route::get('/customers', function () {
        return Inertia::render('admin/customers/page');
    })->name('admin.customers');
    
    // Orders
    Route::get('/orders', function () {
        return Inertia::render('orders/page');
    })->name('admin.orders');
    
    // Analytics
    Route::get('/analytics', function () {
        return Inertia::render('admin/analytics/page');
    })->name('admin.analytics');
    
    // Settings
    Route::get('/settings', function () {
        return Inertia::render('admin/settings/page');
    })->name('admin.settings');
});

// Admin API routes
Route::prefix('/api/admin')->middleware(['auth'])->group(function () {
    Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
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
