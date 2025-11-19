<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    /**
     * Display the products management page
     */
    public function index()
    {
        $products = Product::with(['category', 'brand', 'images'])->latest()->paginate(20);
        $categories = Category::active()->ordered()->get();
        $brands = Brand::active()->ordered()->get();
        $tags = Tag::active()->get();
        
        return inertia('admin/products/page', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'tags' => $tags,
        ]);
    }
    public function create()
    {
        $categories = Category::active()->ordered()->get();
        $brands = Brand::active()->ordered()->get();
        $tags = Tag::active()->get();

        return inertia('admin/products/create', [
            'categories' => $categories,
            'brands' => $brands,
            'tags' => $tags,
        ]);
    }

    function show(Product $product)
    {
        $product->load(['category', 'brand', 'tags', 'images']);

        return inertia('admin/products/show', [
            'product' => $product,
            'categories' => Category::active()->ordered()->get(),
            'brands' => Brand::active()->ordered()->get(),
            'tags' => Tag::active()->get(),
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
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'barcode' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'min_stock_quantity' => 'nullable|integer|min:0',
            'track_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'string|max:50',
            'colors' => 'nullable|array',
            'colors.*' => 'string|max:50',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'material' => 'nullable|string|max:255',
            'origin' => 'nullable|string|max:255',
            'fit' => 'nullable|string|max:255',
            'care_instructions' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array',
            'images.*.file' => 'required|image|max:5120', // 5MB max
            'images.*.is_primary' => 'boolean',
            'images.*.alt_text' => 'nullable|string|max:255',
        ]);

        // Helper function to convert FormData boolean values
        $toBoolean = function ($value, $default = false) {
            if ($value === null || $value === '') {
                return $default;
            }
            if (is_bool($value)) {
                return $value;
            }
            return in_array($value, ['1', 'true', 'on', 'yes'], true);
        };

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'short_description' => $validated['short_description'] ?? null,
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'cost_price' => $validated['cost_price'] ?? null,
            'sku' => $validated['sku'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'stock_quantity' => $validated['stock_quantity'] ?? 0,
            'min_stock_quantity' => $validated['min_stock_quantity'] ?? 0,
            'track_stock' => $toBoolean($validated['track_stock'] ?? null, true),
            'is_active' => $toBoolean($validated['is_active'] ?? null, true),
            'is_featured' => $toBoolean($validated['is_featured'] ?? null, false),
            'weight' => $validated['weight'] ?? null,
            'length' => $validated['length'] ?? null,
            'width' => $validated['width'] ?? null,
            'height' => $validated['height'] ?? null,
            'sizes' => $validated['sizes'] ?? null,
            'colors' => $validated['colors'] ?? null,
            'features' => $validated['features'] ?? null,
            'material' => $validated['material'] ?? null,
            'origin' => $validated['origin'] ?? null,
            'fit' => $validated['fit'] ?? null,
            'care_instructions' => $validated['care_instructions'] ?? null,
            'category_id' => $validated['category_id'] ? (int)$validated['category_id'] : null,
            'brand_id' => $validated['brand_id'] ? (int)$validated['brand_id'] : null,
        ]);

        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $product->tags()->attach($validated['tags']);
        }

        if ($request->has('images') && is_array($validated['images'])) {
            $product->saveImages($validated['images']);
        }

        return redirect()->route('admin.products')->with('success', 'Product created successfully');
    }
    public function edit(Product $product)
    {
        $product->load(['category', 'brand', 'tags', 'images']);

        return inertia('admin/products/edit', [
            'product' => $product,
            'categories' => Category::active()->ordered()->get(),
            'brands' => Brand::active()->ordered()->get(),
            'tags' => Tag::active()->get(),
        ]);
    }
    
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'min_stock_quantity' => 'nullable|integer|min:0',
            'track_stock' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'sizes' => 'nullable|array',
            'sizes.*' => 'string|max:50',
            'colors' => 'nullable|array',
            'colors.*' => 'string|max:50',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'material' => 'nullable|string|max:255',
            'origin' => 'nullable|string|max:255',
            'fit' => 'nullable|string|max:255',
            'care_instructions' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'images' => 'nullable|array',
            'images.*.file' => 'required|image|max:5120', // 5MB max
            'images.*.is_primary' => 'boolean',
            'images.*.alt_text' => 'nullable|string|max:255',
        ]);

        // Helper function to convert FormData boolean values
        $toBoolean = function ($value, $default = false) {
            if ($value === null || $value === '') {
                return $default;
            }
            if (is_bool($value)) {
                return $value;
            }
            return in_array($value, ['1', 'true', 'on', 'yes'], true);
        };

        $product->update([
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'short_description' => $validated['short_description'] ?? null,
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'cost_price' => $validated['cost_price'] ?? null,
            'sku' => $validated['sku'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
            'stock_quantity' => $validated['stock_quantity'] ?? 0,
            'min_stock_quantity' => $validated['min_stock_quantity'] ?? 0,
            'track_stock' => $toBoolean($validated['track_stock'] ?? null, true),
            'is_active' => $toBoolean($validated['is_active'] ?? null, true),
            'is_featured' => $toBoolean($validated['is_featured'] ?? null, false),
            'weight' => $validated['weight'] ?? null,
            'length' => $validated['length'] ?? null,
            'width' => $validated['width'] ?? null,
            'height' => $validated['height'] ?? null,
            'sizes' => $validated['sizes'] ?? null,
            'colors' => $validated['colors'] ?? null,
            'features' => $validated['features'] ?? null,
            'material' => $validated['material'] ?? null,
            'origin' => $validated['origin'] ?? null,
            'fit' => $validated['fit'] ?? null,
            'care_instructions' => $validated['care_instructions'] ?? null,
            'category_id' => $validated['category_id'] ? (int)$validated['category_id'] : null,
            'brand_id' => $validated['brand_id'] ? (int)$validated['brand_id'] : null,
        ]);

        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $product->tags()->sync($validated['tags']);
        } else {
            $product->tags()->detach();
        }

        if ($request->has('images') && is_array($validated['images'])) {
            $product->saveImages($validated['images']);
        }

        return redirect()->route('admin.products.view', $product)->with('success', 'Product updated successfully');
    }
    public function delete(Product $product)
    {


        if ($product->delete()) {
            return redirect()->back()->with('success', 'Product deleted successfully');
            # code...
        }
        return redirect()->back()->with('fail', 'Product not deleted successfully');
      

    }
    public function restore(Product $product)
    {


        if ($product->restore()) {
            return redirect()->back()->with('success', 'Product restored successfully');
            # code...
        }
        return redirect()->back()->with('fail', 'Product not restored successfully');
      

    }
}

