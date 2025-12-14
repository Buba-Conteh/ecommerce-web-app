<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Display inventory management page
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'images'])
            ->where('track_stock', true);

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low':
                    $query->whereColumn('stock_quantity', '<=', 'min_stock_quantity');
                    break;
                case 'out':
                    $query->where('stock_quantity', '<=', 0);
                    break;
                case 'in_stock':
                    $query->where('stock_quantity', '>', 0);
                    break;
            }
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('stock_quantity', 'asc')->paginate(20)->withQueryString();

        // Get inventory statistics
        $stats = [
            'total_products' => Product::where('track_stock', true)->count(),
            'low_stock' => Product::where('track_stock', true)
                ->whereColumn('stock_quantity', '<=', 'min_stock_quantity')
                ->count(),
            'out_of_stock' => Product::where('track_stock', true)
                ->where('stock_quantity', '<=', 0)
                ->count(),
            'in_stock' => Product::where('track_stock', true)
                ->where('stock_quantity', '>', 0)
                ->count(),
            'total_value' => Product::where('track_stock', true)
                ->sum(DB::raw('stock_quantity * cost_price')),
        ];

        return Inertia::render('admin/inventory/page', [
            'products' => $products,
            'stats' => $stats,
            'filters' => $request->only(['stock_status', 'search']),
        ]);
    }

    /**
     * Update product stock
     */
    public function updateStock(Request $request, Product $product)
    {
        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->update([
            'stock_quantity' => $request->stock_quantity,
        ]);

        return redirect()->back()->with('success', 'Stock updated successfully');
    }
}

