<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display the product form
     */
    public function create()
    {
        $categories = Category::active()->ordered()->get();
        $brands = Brand::active()->ordered()->get();
        $tags = Tag::active()->get();

        return inertia('admin/products/page', [
            'categories' => $categories,
            'brands' => $brands,
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'stock_quantity' => 'nullable|integer|min:0',
            'track_stock' => 'boolean',
            'is_featured' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array',
            'images.*.file' => 'required|image|max:2048',
            'images.*.is_primary' => 'boolean',
        ]);

        // Create the product
        $product = Product::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'short_description' => $validated['short_description'] ?? null,
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'sku' => $validated['sku'] ?? null,
            'stock_quantity' => $validated['stock_quantity'] ?? 0,
            'track_stock' => $validated['track_stock'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
        ]);

        // Attach tags if provided
        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $product->tags()->attach($validated['tags']);
        }

        // Handle image uploads
        if ($request->has('images')) {
            foreach ($validated['images'] as $index => $imageData) {
                $image = $imageData['file'];
                $isPrimary = $imageData['is_primary'] ?? false;

                // Store the image
                $path = $image->store('products', 'public');

                // Create product image record
                $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $product->name,
                    'is_primary' => $isPrimary,
                    'sort_order' => $index,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Product created successfully');
    }
}

