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
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

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
    public function store(ProductRequest $productRequest)
    {       // Log incoming uploaded files for debugging
        try {
            Log::info('Admin ProductController.store called', [
                'files' => $productRequest->allFiles(),
                'input_images' => $productRequest->input('images'),
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log product request files', ['error' => $e->getMessage()]);
        }
      
        if ($productRequest->save()) {
            return redirect()->route('admin.products')->with('success', 'Product created successfully');
        }
        return redirect()->back()->with('error', 'Failed to create product');
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
    
     public function update(Product $product, ProductRequest $productRequest)
    {
        try {
            if ($productRequest->save($product)) {
                return redirect()->route('admin.products.edit', $product->id)
                    ->with('success', 'Product updated successfully');
            }
            
            return redirect()->back()->with('error', 'Failed to update product');
        } catch (\Exception $e) {
            Log::error('Product update failed', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'An error occurred while updating the product');
        }
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

