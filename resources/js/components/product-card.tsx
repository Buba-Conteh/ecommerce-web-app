"use client"

import { useState } from "react"
import { router } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart, Eye, Check } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  isOnSale?: boolean
  category: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart, onAddToWishlist, onQuickView }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleCardClick = () => {
    router.visit(`/products/${product.id}`)
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await onAddToCart?.(product.id)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlistToggle = async () => {
    try {
      await onAddToWishlist?.(product.id)
      setIsWishlisted(!isWishlisted)
    } catch (error) {
      console.error("Failed to update wishlist:", error)
    }
  }

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0
console.log(product);

  return (
    <Card
      className="group cursor-pointer border-border hover:shadow-lg transition-all duration-300"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="aspect-square bg-secondary rounded-t-lg overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                handleWishlistToggle()
              }}
              className={isWishlisted ? "bg-accent text-accent-foreground" : ""}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onQuickView?.(product.id)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isOnSale && <Badge className="bg-accent text-accent-foreground">-{discountPercentage}%</Badge>}
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              className={`w-full transition-all duration-300 ${
                showSuccess ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              disabled={isLoading}
            >
              {showSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isLoading ? "Adding..." : "Add to Cart"}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h4 className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i <= product.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">({product.reviewCount})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
