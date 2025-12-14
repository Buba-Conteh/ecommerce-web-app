<?php

namespace App\Http\Requests;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderRequest extends FormRequest
{
    /**
     * The cart instance validated in the request.
     */
    public ?Cart $cart = null;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string'],
            
            // Shipping address - either ID or full address object
            'shipping_address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'shipping_address' => ['required_without:shipping_address_id', 'array'],
            'shipping_address.first_name' => ['required_without:shipping_address_id', 'string', 'max:255'],
            'shipping_address.last_name' => ['required_without:shipping_address_id', 'string', 'max:255'],
            'shipping_address.address_line_1' => ['required_without:shipping_address_id', 'string', 'max:255'],
            'shipping_address.city' => ['required_without:shipping_address_id', 'string', 'max:255'],
            'shipping_address.state' => ['required_without:shipping_address_id', 'string', 'max:255'],
            'shipping_address.postal_code' => ['required_without:shipping_address_id', 'string', 'max:50'],
            'shipping_address.country' => ['required_without:shipping_address_id', 'string', 'max:100'],
            'shipping_address.phone' => ['nullable', 'string', 'max:50'],
            
            // Billing address (optional if same as shipping)
            'billing_address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'billing_address' => ['nullable', 'array'],
            'billing_address.first_name' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.last_name' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.address_line_1' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.city' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.state' => ['required_with:billing_address', 'string', 'max:255'],
            'billing_address.postal_code' => ['required_with:billing_address', 'string', 'max:50'],
            'billing_address.country' => ['required_with:billing_address', 'string', 'max:100'],
            'billing_address.phone' => ['nullable', 'string', 'max:50'],
            
            'payment_method' => ['required', 'string', 'in:stripe,paypal,credit_card'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_amount' => ['required', 'numeric', 'min:0'],
            'shipping_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

   

    public $order = null;

    function save() : bool {
        $user = $this->user();

        DB::beginTransaction();
        try {
            // Get or create customer
            $shippingAddressData = $this->input('shipping_address', []);
            
            if ($user && $user->customer) {
                $customer = $user->customer;
            } else {
                // Create customer from shipping address data
                $customer = Customer::create([
                    'first_name' => $shippingAddressData['first_name'] ?? ($user ? $user->name : 'Guest'),
                    'last_name' => $shippingAddressData['last_name'] ?? '',
                    'email' => $shippingAddressData['email'] ?? ($user ? $user->email : null),
                    'phone' => $shippingAddressData['phone'] ?? null,
                    'user_id' => $user?->id,
                    'is_active' => true,
                ]);
            }

            // Handle shipping address
            $shippingAddressData = $this->input('shipping_address');
            $shippingAddressId = $this->input('shipping_address_id');
            
            if ($shippingAddressId && $customer->addresses()->where('id', $shippingAddressId)->exists()) {
                // Use existing address
            } else {
                // Create new shipping address
                if (empty($shippingAddressData)) {
                    throw new \Exception('Shipping address is required');
                }
                
                $shipping = $customer->addresses()->create([
                    'first_name' => $shippingAddressData['first_name'],
                    'last_name' => $shippingAddressData['last_name'],
                    'address_line_1' => $shippingAddressData['address_line_1'],
                    'address_line_2' => $shippingAddressData['address_line_2'] ?? null,
                    'city' => $shippingAddressData['city'],
                    'state' => $shippingAddressData['state'],
                    'postal_code' => $shippingAddressData['postal_code'],
                    'country' => $shippingAddressData['country'],
                    'phone' => $shippingAddressData['phone'] ?? null,
                    'type' => 'shipping',
                ]);
                $shippingAddressId = $shipping->id;
            }
            
            // Handle billing address if different from shipping
            $billingAddressId = $this->input('billing_address_id');
            $billingAddressData = $this->input('billing_address');
            
            if ($billingAddressId && $customer->addresses()->where('id', $billingAddressId)->exists()) {
                // Use existing billing address
            } elseif (!empty($billingAddressData)) {
                // Create new billing address
                $billing = $customer->addresses()->create([
                    'first_name' => $billingAddressData['first_name'],
                    'last_name' => $billingAddressData['last_name'],
                    'address_line_1' => $billingAddressData['address_line_1'],
                    'address_line_2' => $billingAddressData['address_line_2'] ?? null,
                    'city' => $billingAddressData['city'],
                    'state' => $billingAddressData['state'],
                    'postal_code' => $billingAddressData['postal_code'],
                    'country' => $billingAddressData['country'],
                    'phone' => $billingAddressData['phone'] ?? null,
                    'type' => 'billing',
                ]);
                $billingAddressId = $billing->id;
            } else {
                // Use shipping address as billing address
                $billingAddressId = $shippingAddressId;
            }

            // Create order
            $this->order = $customer->orders()->create([
                'user_id' => $user?->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'status' => 'pending',
                'subtotal' => $this->subtotal,
                'tax_amount' => $this->tax_amount,
                'shipping_amount' => $this->shipping_amount ?? 0,
                'discount_amount' => $this->discount_amount ?? 0,
                'total' => $this->total,
                'shipping_address_id' => $shippingAddressId,
                'payment_method' => $this->payment_method ?? 'stripe',
                'notes' => $this->notes ?? null,
            ]);

            // Create order items from cart items
            $items = $this->input('items', []);
            
            if (empty($items)) {
                throw new \Exception('No items provided for order');
            }
            
            foreach ($items as $item) {
                $product = \App\Models\Product::find($item['id']);
                
                if (!$product) {
                    throw new \Exception("Product with ID {$item['id']} not found");
                }

                // Update inventory if tracking stock
                if ($product->track_stock) {
                    if ($product->stock_quantity < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product: {$product->name}");
                    }
                    $product->decrement('stock_quantity', $item['quantity']);
                }

                $this->order->items()->create([
                    'product_id' => $item['id'],
                    'product_name' => $item['name'] ?? $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);
            }

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            logger()->error('Order creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
}
