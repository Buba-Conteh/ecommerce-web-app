<?php

namespace App\Models;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;

class Product extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'min_stock_quantity' => 'integer',
        'track_stock' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'sizes' => 'array',
        'colors' => 'array',
        'features' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    public function getPrimaryImageAttribute()
    {
        return $this->images()->where('is_primary', true)->first();
    }

    public function getIsInStockAttribute()
    {
        if (!$this->track_stock) {
            return true;
        }
        return $this->stock_quantity > 0;
    }

    public function getIsLowStockAttribute()
    {
        if (!$this->track_stock) {
            return false;
        }
        return $this->stock_quantity <= $this->min_stock_quantity;
    }

    public function saveImages(array $productImages): bool
    {
        foreach ($productImages as $index => $img) {
            try {
                // Ensure we have a file
                if (!isset($img['file']) || !$img['file']) {
                    continue;
                }

                // Upload to Cloudinary - get the real path from the uploaded file
                $file = $img['file'];
                $uploadedFileUrl = Cloudinary::upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'shopma-products',
                        'public_id' => 'product_' . $this->id . '_' . time() . '_' . $index,
                    ]
                )->getSecurePath();

                // Save Cloudinary URL to database
                $this->images()->create([
                    'image_path' => $uploadedFileUrl, // Store Cloudinary URL directly
                    'is_primary' => isset($img['is_primary']) && ($img['is_primary'] === true || $img['is_primary'] === '1' || $img['is_primary'] === 1),
                    'alt_text' => $img['alt_text'] ?? $this->name ?? null,
                    'sort_order' => isset($img['sort_order']) ? (int)$img['sort_order'] : $index,
                ]);
            } catch (\Exception $e) {
                // Log error and continue with next image
                Log::error('Failed to upload image to Cloudinary: ' . $e->getMessage(), [
                    'product_id' => $this->id,
                    'image_index' => $index,
                    'error' => $e->getMessage(),
                ]);
                continue;
            }
        }

        return true;
    }
 
}

