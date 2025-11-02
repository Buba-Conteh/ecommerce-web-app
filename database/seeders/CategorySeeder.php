<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
	public function run(): void
	{
		$now = now();

		$rootCategories = [
			['name' => 'Electronics', 'description' => 'Devices and gadgets'],
			['name' => 'Fashion', 'description' => 'Clothing and accessories'],
			['name' => 'Home & Kitchen', 'description' => 'Furniture and appliances'],
			['name' => 'Sports', 'description' => 'Sportswear and equipment'],
		];

		$childrenMap = [
			'Electronics' => ['Phones', 'Laptops', 'Audio', 'Cameras'],
			'Fashion' => ['Men', 'Women', 'Kids'],
			'Home & Kitchen' => ['Furniture', 'Appliances', 'Decor'],
			'Sports' => ['Fitness', 'Outdoor', 'Team Sports'],
		];

		$created = [];
		foreach ($rootCategories as $index => $root) {
			$category = Category::create([
				'name' => $root['name'],
				'slug' => Str::slug($root['name']),
				'description' => $root['description'],
				'is_active' => true,
				'sort_order' => $index,
				'created_at' => $now,
				'updated_at' => $now,
			]);
			$created[$root['name']] = $category->id;
		}

		foreach ($childrenMap as $parentName => $children) {
			$parentId = $created[$parentName] ?? null;
			if (!$parentId) {
				continue;
			}
			foreach ($children as $childIndex => $childName) {
				Category::create([
					'name' => $childName,
					'slug' => Str::slug($childName),
					'description' => null,
					'is_active' => true,
					'sort_order' => $childIndex,
					'parent_id' => $parentId,
					'created_at' => $now,
					'updated_at' => $now,
				]);
			}
		}
	}
}


