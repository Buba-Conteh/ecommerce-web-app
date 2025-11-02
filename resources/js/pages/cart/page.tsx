"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react"
import { cartApi } from "@/services/api"
import { useCart } from "@/components/cart-provider"

interface CartItem {
  id: number
  quantity: number
  price: number
  total: number
  product: {
    id: number
    name: string
    price: number
    images: Array<{
      id: number
      url: string
      is_primary: boolean
    }>
    category: {
      id: number
      name: string
    }
  }
}

interface Cart {
  id: number
  user_id: number
  total: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  items: CartItem[]
}

interface CartPageProps {
  cart: Cart | null
}

export default function CartPage({ cart: initialCart }: CartPageProps) {
  const { state, removeFromCart, updateCartItem } = useCart()
  const [cart, setCart] = useState<Cart | null>(initialCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => new Set(prev).add(itemId))
    
    try {
      await cartApi.updateCartItem(itemId, { quantity: newQuantity })
      await fetchCart() // Refresh cart data
    } catch (err) {
      console.error('Failed to update quantity:', err)
      alert('Failed to update quantity')
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      await cartApi.removeCartItem(itemId)
      await fetchCart() // Refresh cart data
      
      // Also remove from local cart state
      removeFromCart(itemId.toString())
    } catch (err) {
      console.error('Failed to remove item:', err)
      alert('Failed to remove item')
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      await cartApi.clearCart()
      await fetchCart() // Refresh cart data
      
      // Clear local cart state
      // You might want to add a clearCart method to your cart provider
    } catch (err) {
      console.error('Failed to clear cart:', err)
      alert('Failed to clear cart')
    }
  }

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button 
              onClick={fetchCart} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images.find(img => img.is_primary)?.url || item.product.images[0]?.url || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.product.category.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          ${item.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          each
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id) || item.quantity <= 1}
                          className="px-2 py-1 h-8 w-8"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-3 py-1 min-w-[3rem] text-center">
                          {updatingItems.has(item.id) ? '...' : item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                          className="px-2 py-1 h-8 w-8"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="font-semibold text-foreground">
                        Total: ${item.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Cart Actions */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive"
              >
                Clear Cart
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.subtotal}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${cart.tax_amount}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {cart.shipping_amount === 0 ? 'Free' : `$${cart.shipping_amount}`}
                  </span>
                </div>
                
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-${cart.discount_amount}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${cart.total}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Promotional Code */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>🚚</span>
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🔄</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
