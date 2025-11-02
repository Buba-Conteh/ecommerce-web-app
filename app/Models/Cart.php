<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'customer_id',
        'user_id',
        'currency',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total',
        'notes',
        'expires_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        });
    }

    public function scopeBySession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function calculateTotals()
    {
        $subtotal = $this->items->sum('total_price');
        $this->subtotal = $subtotal;
        $this->total = $subtotal + $this->tax_amount - $this->discount_amount;
        $this->save();
    }

    public function getItemCountAttribute()
    {
        return $this->items->sum('quantity');
    }
}
