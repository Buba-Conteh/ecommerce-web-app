<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'brand', 'images', 'tags'])
            ->active()
            ->withCount('orderItems');

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by brand
        if ($request->has('brand_id') && $request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by availability
        if ($request->has('in_stock')) {
            $query->inStock();
        }

        // Sort products
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['name', 'price', 'created_at', 'order_items_count'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Products retrieved successfully'
        ]);
    }

    /**
     * Display the specified product
     */
    public function show($id): JsonResponse
    {
        $product = Product::with(['category', 'brand', 'images', 'tags'])
            ->active()
            ->findOrFail($id);

        // Get related products
        $relatedProducts = Product::with(['category', 'brand', 'images'])
            ->active()
            ->where('id', '!=', $id)
            ->where('category_id', $product->category_id)
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'related_products' => $relatedProducts
            ],
            'message' => 'Product retrieved successfully'
        ]);
    }

    /**
     * Get featured products
     */
    public function featured(): JsonResponse
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->active()
            ->featured()
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Featured products retrieved successfully'
        ]);
    }

    /**
     * Get products on sale
     */
    public function onSale(): JsonResponse
    {
        $products = Product::with(['category', 'brand', 'images'])
            ->active()
            ->whereNotNull('compare_price')
            ->where('compare_price', '>', 'price')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Sale products retrieved successfully'
        ]);
    }

    /**
     * Get categories for filtering
     */
    public function categories(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->whereHas('products', function ($query) {
                $query->active();
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Categories retrieved successfully'
        ]);
    }

    /**
     * Get brands for filtering
     */
    public function brands(): JsonResponse
    {
        $brands = Brand::withCount('products')
            ->whereHas('products', function ($query) {
                $query->active();
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $brands,
            'message' => 'Brands retrieved successfully'
        ]);
    }
}
