<?php

namespace App\Domain\Order\Entities;

class CartItemData
{
	public function __construct(
		public int $productId,
		public int $quantity,
		public float $unitPrice,
	) {}
}


