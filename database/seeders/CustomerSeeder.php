<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
	public function run(): void
	{
		$now = now();
		$customers = [
			['first_name' => 'John', 'last_name' => 'Doe', 'email' => 'john.doe@example.com'],
			['first_name' => 'Jane', 'last_name' => 'Smith', 'email' => 'jane.smith@example.com'],
			['first_name' => 'Alice', 'last_name' => 'Johnson', 'email' => 'alice.johnson@example.com'],
			['first_name' => 'Bob', 'last_name' => 'Williams', 'email' => 'bob.williams@example.com'],
			['first_name' => 'Charlie', 'last_name' => 'Brown', 'email' => 'charlie.brown@example.com'],
		];

		foreach ($customers as $data) {
			Customer::create([
				'first_name' => $data['first_name'],
				'last_name' => $data['last_name'],
				'email' => $data['email'],
				'phone' => null,
				'gender' => null,
				'notes' => null,
				'is_active' => true,
				'email_verified' => true,
				'email_verified_at' => $now,
				'created_at' => $now,
				'updated_at' => $now,
			]);
		}
	}
}


