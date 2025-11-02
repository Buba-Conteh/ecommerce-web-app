<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
	public function run(): void
	{
		$brands = [
			'Acme', 'Globex', 'Umbrella', 'Initech', 'Hooli', 'Soylent', 'Stark Industries', 'Wayne Enterprises', 'Wonka', 'Cyberdyne'
		];

		$now = now();
		foreach ($brands as $index => $name) {
			Brand::create([
				'name' => $name,
				'slug' => Str::slug($name),
				'description' => null,
				'is_active' => true,
				'sort_order' => $index,
				'created_at' => $now,
				'updated_at' => $now,
			]);
		}
	}
}


