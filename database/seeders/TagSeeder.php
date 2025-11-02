<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
	public function run(): void
	{
		$tags = [
			'New', 'Sale', 'Featured', 'Popular', 'Limited', 'Bestseller', 'Eco', 'Gift', 'Premium', 'Budget',
			'Organic', 'Handmade', 'Hot', 'Trending', 'Clearance', 'Exclusive', 'Editor\'s Pick', 'Essential', 'Top Rated', 'Free Shipping'
		];

		$now = now();
		foreach ($tags as $name) {
			Tag::create([
				'name' => $name,
				'slug' => Str::slug($name),
				'description' => null,
				'is_active' => true,
				'created_at' => $now,
				'updated_at' => $now,
			]);
		}
	}
}


