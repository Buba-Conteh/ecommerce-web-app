<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
	public function run(): void
	{
		$now = now();
		$customers = Customer::all();

		foreach ($customers as $customer) {
			$base = [
				'first_name' => $customer->first_name,
				'last_name' => $customer->last_name,
				'company' => null,
				'address_line_1' => '123 Main St',
				'address_line_2' => null,
				'city' => 'Metropolis',
				'state' => 'CA',
				'postal_code' => '90210',
				'country' => 'USA',
				'phone' => null,
				'is_default' => true,
				'created_at' => $now,
				'updated_at' => $now,
			];

			Address::create(array_merge($base, [
				'customer_id' => $customer->id,
				'type' => 'shipping',
			]));

			Address::create(array_merge($base, [
				'customer_id' => $customer->id,
				'type' => 'billing',
				'is_default' => false,
			]));
		}
	}
}


