<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\GuestCheckoutController;
use App\Http\Controllers\Api\PaymentStubController;
use App\Http\Controllers\Api\CartSyncController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', function(Request $request) {

    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Create token
    $token = $user->createToken('api-token')->plainTextToken;

    return [
        'user' => $user,
        'token' => $token
    ];
});

// Public product routes
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/sale', [ProductController::class, 'onSale']);
    Route::get('/categories', [ProductController::class, 'categories']);
    Route::get('/brands', [ProductController::class, 'brands']);
    Route::get('/{id}', [ProductController::class, 'show']);
});

// Guest checkout (no auth required)
Route::post('/guest-checkout', [GuestCheckoutController::class, 'store']);

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'addItem']);
        Route::put('/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
        Route::post('/sync', [CartSyncController::class, 'store']);
    });

    // Order routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::put('/{id}/cancel', [OrderController::class, 'cancel']);
        Route::get('/{id}/status', [OrderController::class, 'status']);
        Route::post('/{id}/pay', [PaymentStubController::class, 'pay']);
    });
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::get('/user/{user}', [OrderController::class, 'userOrders']);
        Route::put('/{id}/cancel', [OrderController::class, 'cancel']);
        Route::get('/{id}/status', [OrderController::class, 'status']);
        Route::post('/{id}/pay', [PaymentStubController::class, 'pay']);
    });
});
