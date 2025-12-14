<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Check if product has sufficient stock
     */
    public function checkStock(Product $product, int $quantity): bool
    {
        if (!$product->track_stock) {
            return true;
        }

        return $product->stock_quantity >= $quantity;
    }

    /**
     * Decrease product stock
     */
    public function decreaseStock(Product $product, int $quantity): Product
    {
        if ($product->track_stock) {
            if ($product->stock_quantity < $quantity) {
                throw new \Exception("Insufficient stock for product: {$product->name}");
            }

            $product->decrement('stock_quantity', $quantity);
        }

        return $product->fresh();
    }

    /**
     * Increase product stock
     */
    public function increaseStock(Product $product, int $quantity): Product
    {
        if ($product->track_stock) {
            $product->increment('stock_quantity', $quantity);
        }

        return $product->fresh();
    }

    /**
     * Get low stock products
     */
    public function getLowStockProducts(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return Product::where('track_stock', true)
            ->whereColumn('stock_quantity', '<=', 'min_stock_quantity')
            ->where('is_active', true)
            ->orderBy('stock_quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get out of stock products
     */
    public function getOutOfStockProducts(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return Product::where('track_stock', true)
            ->where('stock_quantity', '<=', 0)
            ->where('is_active', true)
            ->orderBy('stock_quantity', 'asc')
            ->limit($limit)
            ->get();
    }
}

