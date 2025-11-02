<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
	public function run(): void
	{
		$now = now();

		$categoryIds = Category::pluck('id')->all();
		$brandIds = Brand::pluck('id')->all();
		$tagIds = Tag::pluck('id')->all();

		if (empty($categoryIds)) {
			$this->command?->warn('No categories found. Run CategorySeeder first.');
			return;
		}

		$products = [
			['name' => 'Smartphone X100', 'price' => 699.99, 'stock' => 150],
			['name' => 'Ultrabook Pro 14"', 'price' => 1299.00, 'stock' => 80],
			['name' => 'Wireless Headphones Z', 'price' => 149.50, 'stock' => 300],
			['name' => 'Mirrorless Camera M5', 'price' => 899.00, 'stock' => 60],
			['name' => '4K Action Cam Go', 'price' => 249.99, 'stock' => 120],
			['name' => 'Gaming Laptop G17', 'price' => 1799.00, 'stock' => 40],
			['name' => 'Bluetooth Speaker Mini', 'price' => 49.99, 'stock' => 500],
			['name' => 'Smartwatch Fit+', 'price' => 199.00, 'stock' => 220],
			['name' => 'DSLR Lens 50mm f/1.8', 'price' => 129.00, 'stock' => 90],
			['name' => 'Noise Cancelling Earbuds', 'price' => 99.00, 'stock' => 260],
		];

		foreach ($products as $index => $data) {
			$categoryId = $categoryIds[array_rand($categoryIds)];
			$brandId = !empty($brandIds) ? $brandIds[array_rand($brandIds)] : null;

			$product = Product::create([
				'name' => $data['name'],
				'slug' => Str::slug($data['name']),
				'description' => 'High-quality product: ' . $data['name'],
				'short_description' => 'Awesome ' . $data['name'],
				'price' => $data['price'],
				'compare_price' => $data['price'] * 1.1,
				'cost_price' => $data['price'] * 0.6,
				'sku' => 'SKU-' . Str::upper(Str::random(8)),
				'barcode' => (string) random_int(100000000000, 999999999999),
				'stock_quantity' => $data['stock'],
				'min_stock_quantity' => 5,
				'track_stock' => true,
				'is_active' => true,
				'is_featured' => $index % 3 === 0,
				'weight' => 0.50,
				'length' => 10.00,
				'width' => 5.00,
				'height' => 2.50,
				'category_id' => $categoryId,
				'brand_id' => $brandId,
				'created_at' => $now,
				'updated_at' => $now,
			]);

			// Images
			$images = [
				['path' => 'products/' . $product->id . '/image1.jpg', 'primary' => true],
				['path' => 'products/' . $product->id . '/image2.jpg', 'primary' => false],
				['path' => 'products/' . $product->id . '/image3.jpg', 'primary' => false],
			];
			foreach ($images as $imgIndex => $img) {
				ProductImage::create([
					'product_id' => $product->id,
					'image_path' => $img['path'],
					'alt_text' => $product->name . ' ' . ($imgIndex + 1),
					'is_primary' => $img['primary'],
					'sort_order' => $imgIndex,
					'created_at' => $now,
					'updated_at' => $now,
				]);
			}

			// Tags
			if (!empty($tagIds)) {
				$randomTagIds = collect($tagIds)->shuffle()->take(rand(2, 5))->all();
				$product->tags()->attach($randomTagIds);
			}
		}
	}
}


