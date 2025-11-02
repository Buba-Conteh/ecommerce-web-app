<?php

use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
});

// Admin API routes
Route::prefix('/api/admin')->middleware(['auth'])->group(function () {
    Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
