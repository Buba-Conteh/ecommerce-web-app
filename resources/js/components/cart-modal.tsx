"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { router } from "@inertiajs/react"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { state, removeFromCart, updateQuantity } = useCart()
  const { items } = state

  if (!isOpen) return null

  const total = items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-lg">Shopping Cart</h3>
              <p className="text-sm text-muted-foreground">{itemCount} items</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!items || items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border border-border rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="object-cover rounded w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.visit(`/products/${item.id}`)
                      }}
                    >
                      {item.name}
                    </h4>
                    <p className="text-primary font-semibold">${item.price}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <Badge variant="secondary" className="px-2">
                        {item.quantity}
                      </Badge>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive ml-auto text-xs"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items && items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => {
                onClose()
                // Navigate to orders page - cart data will be available via context
                router.visit('/checkout')
              }}
            >
              Complete Order
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
