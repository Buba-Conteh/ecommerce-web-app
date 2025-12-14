<?php

namespace App\Models;

use App\Casts\CastCurrency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'subtotal' => CastCurrency::class,
        'tax_amount' => CastCurrency::class,
        'shipping_amount' => CastCurrency::class,
        'discount_amount' => CastCurrency::class,
        'total' => CastCurrency::class,
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
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
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getItemCountAttribute()
    {
        return $this->items->sum('quantity');
    }

    public function getIsPaidAttribute()
    {
        return $this->payments()->where('status', 'completed')->sum('amount') >= $this->total;
    }

    public function getIsShippedAttribute()
    {
        return !is_null($this->shipped_at);
    }

    public function getIsDeliveredAttribute()
    {
        return !is_null($this->delivered_at);
    }

    function createCustomer(Customer $customer) : bool {

         $customer->first_name = $this->first_name;
         $customer->last_name = $this->last_name; 
        $customer->email = $this->email;
        $customer->phone = $this->phone;
            
        return $customer->save();
    }
}
