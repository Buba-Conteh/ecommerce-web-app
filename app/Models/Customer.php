<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'notes',
        'is_active',
        'email_verified',
        'email_verified_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'email_verified' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('email_verified', true);
    }

    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getDefaultShippingAddressAttribute()
    {
        return $this->addresses()->where('type', 'shipping')->where('is_default', true)->first();
    }

    public function getDefaultBillingAddressAttribute()
    {
        return $this->addresses()->where('type', 'billing')->where('is_default', true)->first();
    }
}
