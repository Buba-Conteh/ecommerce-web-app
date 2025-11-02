import { router } from '@inertiajs/react'

// Product API methods using Inertia.js
export const productApi = {
  // Get all products with filtering and pagination
  getProducts: (params = {}) => 
    router.get('/api/products', params, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Get featured products
  getFeatured: () => 
    router.get('/api/products/featured', {}, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Get products on sale
  getOnSale: () => 
    router.get('/api/products/sale', {}, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Get product by ID
  getProduct: (id: string | number) => 
    router.get(`/api/products/${id}`, {}, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Get categories
  getCategories: () => 
    router.get('/api/products/categories', {}, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Get brands
  getBrands: () => 
    router.get('/api/products/brands', {}, {
      preserveState: true,
      preserveScroll: true,
    }),
}

// Cart API methods using Inertia.js
export const cartApi = {
  // Get user's cart
  getCart: () => 
    router.get('/api/cart', {}, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Add item to cart
  addToCart: (data: { product_id: number; quantity: number }) => 
    router.post('/api/cart/add', data, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Update cart item quantity
  updateCartItem: (itemId: number, data: { quantity: number }) => 
    router.put(`/api/cart/items/${itemId}`, data, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Remove item from cart
  removeCartItem: (itemId: number) => 
    router.delete(`/api/cart/items/${itemId}`, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Clear entire cart
  clearCart: () => 
    router.delete('/api/cart/clear', {
      preserveState: true,
      preserveScroll: true,
    }),

  // Sync authenticated cart with front-end items
  syncCart: (items: Array<{ id: number; quantity: number }>) =>
    router.post('/api/cart/sync', { items }, { preserveState: true, preserveScroll: true }),
}

// Order API methods using Inertia.js
export const orderApi = {
  // Reload page to get fresh orders data (data should come from Inertia props)
  refreshOrders: () => 
    router.reload({
      only: ['orders'],
    }),

  // Navigate to order detail page (data should come from Inertia props)
  viewOrder: (id: number) => 
    router.visit(`/orders/${id}`, {
      preserveState: true,
      preserveScroll: true,
    }),

  // Create new order
  createOrder: (data: {
    shipping_address_id: number;
    billing_address_id: number;
    payment_method: string;
    notes?: string;
  }) => 
    router.post('/api/orders', data, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Reload to get updated cart/orders
        router.reload({ only: ['orders', 'cart'] })
      },
    }),

  // Create guest order from front-end cart
  createGuestOrder: (data: {
    customer: {
      first_name: string;
      last_name: string;
      email: string;
      address_line_1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    items: Array<{ id: string | number; quantity: number; price: number }>;
  }) =>
    fetch('/api/guest-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(data),
      credentials: 'same-origin',
    }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to create guest order')
      return res.json()
    }),

  // Cancel order
  cancelOrder: (id: number) => 
    router.put(`/api/orders/${id}/cancel`, {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Reload to get updated orders
        router.reload({ only: ['orders'] })
      },
    }),

  // Get order status (reloads page with updated status)
  refreshOrderStatus: (id: number) => 
    router.reload({
      only: ['order'],
    }),
}

// Generic API methods
export const apiService = {
  // Make a custom request
  request: (method: string, url: string, data = {}) => {
    switch (method.toLowerCase()) {
      case 'get':
        return router.get(url, data, { preserveState: true, preserveScroll: true })
      case 'post':
        return router.post(url, data, { preserveState: true, preserveScroll: true })
      case 'put':
        return router.put(url, data, { preserveState: true, preserveScroll: true })
      case 'delete':
        return router.delete(url, { preserveState: true, preserveScroll: true })
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    // This will depend on how you're handling authentication in your Inertia app
    // You might want to check a global state or prop
    return true // Placeholder - implement based on your auth setup
  },
}

export default { productApi, cartApi, orderApi, apiService }
