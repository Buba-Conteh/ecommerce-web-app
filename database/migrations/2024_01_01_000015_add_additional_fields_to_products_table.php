<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // JSON fields for sizes, colors, and features
            $table->json('sizes')->nullable()->after('height');
            $table->json('colors')->nullable()->after('sizes');
            $table->json('features')->nullable()->after('colors');
            
            // Text fields for product specifications
            $table->string('material')->nullable()->after('features');
            $table->string('origin')->nullable()->after('material');
            $table->string('fit')->nullable()->after('origin');
            $table->text('care_instructions')->nullable()->after('fit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'sizes',
                'colors',
                'features',
                'material',
                'origin',
                'fit',
                'care_instructions',
            ]);
        });
    }
};

