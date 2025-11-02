<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'transaction_id',
        'payment_gateway',
        'status',
        'amount',
        'currency',
        'payment_data',
        'notes',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_data' => 'array',
        'processed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByGateway($query, $gateway)
    {
        return $query->where('payment_gateway', $gateway);
    }

    public function getIsSuccessfulAttribute()
    {
        return in_array($this->status, ['completed', 'processing']);
    }

    public function getIsFailedAttribute()
    {
        return in_array($this->status, ['failed', 'cancelled']);
    }
}
