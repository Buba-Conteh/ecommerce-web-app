<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'price',
        'compare_price',
        'cost_price',
        'sku',
        'barcode',
        'stock_quantity',
        'min_stock_quantity',
        'track_stock',
        'is_active',
        'is_featured',
        'weight',
        'length',
        'width',
        'height',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'category_id',
        'brand_id',
    ];

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
}
