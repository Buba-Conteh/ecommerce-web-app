<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Optional: truncate tables for a clean slate in local/dev
        // DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->call([
            CategorySeeder::class,
            BrandSeeder::class,
            TagSeeder::class,
            // ProductSeeder::class,
            CustomerSeeder::class,
            // AddressSeeder::class,
            // CartSeeder::class,
            // OrderSeeder::class,
        ]);

        // DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Ensure at least one user exists for admin/testing
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }
    }
}
