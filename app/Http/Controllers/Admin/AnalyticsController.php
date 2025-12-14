<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Display analytics dashboard
     */
    public function index(Request $request)
    {
        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Sales data for chart
        $salesData = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as sales'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('M d'),
                    'sales' => (float) $item->sales,
                    'orders' => $item->orders,
                ];
            });

        // Category sales data
        $categoryData = Category::withCount(['products' => function ($query) use ($startDate, $endDate) {
            $query->whereHas('orderItems.order', function ($orderQuery) use ($startDate, $endDate) {
                $orderQuery->where('status', '!=', 'cancelled')
                           ->whereBetween('created_at', [$startDate, $endDate]);
            });
        }])
        ->having('products_count', '>', 0)
        ->get()
        ->map(function ($category) {
            return [
                'name' => $category->name,
                'value' => $category->products_count,
            ];
        });

        // Top selling products
        $topProducts = Product::with(['images', 'category'])
            ->whereHas('orderItems.order', function ($query) use ($startDate, $endDate) {
                $query->where('status', '!=', 'cancelled')
                      ->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->withCount(['orderItems' => function ($query) use ($startDate, $endDate) {
                $query->whereHas('order', function ($orderQuery) use ($startDate, $endDate) {
                    $orderQuery->where('status', '!=', 'cancelled')
                               ->whereBetween('created_at', [$startDate, $endDate]);
                });
            }])
            ->orderBy('order_items_count', 'desc')
            ->limit(10)
            ->get();

        // Statistics
        $totalRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total');

        $previousPeriodRevenue = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [
                $startDate->copy()->subDays($days),
                $startDate
            ])
            ->sum('total');

        $revenueGrowth = $previousPeriodRevenue > 0
            ? (($totalRevenue - $previousPeriodRevenue) / $previousPeriodRevenue) * 100
            : 0;

        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Customer retention (customers with multiple orders)
        $returningCustomers = Customer::whereHas('orders', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        })
        ->withCount(['orders' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->having('orders_count', '>', 1)
        ->count();

        $totalCustomersWithOrders = Customer::whereHas('orders', function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        })->count();

        $customerRetention = $totalCustomersWithOrders > 0
            ? ($returningCustomers / $totalCustomersWithOrders) * 100
            : 0;

        return Inertia::render('admin/analytics/page', [
            'salesData' => $salesData,
            'categoryData' => $categoryData,
            'topProducts' => $topProducts,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'revenue_growth' => round($revenueGrowth, 1),
                'total_orders' => $totalOrders,
                'total_customers' => $totalCustomers,
                'avg_order_value' => round($avgOrderValue, 2),
                'customer_retention' => round($customerRetention, 1),
            ],
            'days' => $days,
        ]);
    }
}

