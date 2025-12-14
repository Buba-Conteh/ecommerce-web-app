<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    function index()
    {
        $customers = Customer::withCount('orders')->get();

        return inertia('admin/customers/page', [
            'customers' => $customers
        ]);
    }
}
