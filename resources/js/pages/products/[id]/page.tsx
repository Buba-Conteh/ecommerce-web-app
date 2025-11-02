"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { productApi, cartApi } from "@/services/api"
import { CartProvider, useCart } from "@/components/cart-provider"

interface Product {
  id: number
  name: string
  description: string
  short_description: string
  price: number
  compare_price?: number
  stock_quantity: number
  track_stock: boolean
  category: {
    id: number
    name: string
  }
  brand: {
    id: number
    name: string
  }
  images: Array<{
    id: number
    url: string
    is_primary: boolean
  }>
  tags: Array<{
    id: number
    name: string
  }>
}

function ProductDetailContent({ id }: { id: number | string }) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${id}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (!res.ok) throw new Error('Failed to fetch product')
        const json = await res.json()
        const payload = json.data || json
        const productData = payload.product || payload
        const related_products = payload.related_products || []
        
        setProduct(productData)
        setRelatedProducts(related_products)
        
        // Set primary image as selected
        const primaryImage = productData.images.find(img => img.is_primary)
        setSelectedImage(primaryImage?.url || productData.images[0]?.url || "/placeholder.svg")
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product')
        console.error('Failed to fetch product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id !== undefined && id !== null) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return

    try {
      // Add to local cart state
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: selectedImage,
      })

      // For guests, do not call backend cart; keep on front-end only
      // Show success message (you can implement a toast notification here)
      alert('Product added to cart!')
    } catch (err) {
      console.error('Failed to add to cart:', err)
      alert('Failed to add product to cart')
    }
  }

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    alert('Wishlist functionality coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <p className="text-red-500">Error: {error || 'Product not found'}</p>
            <Button 
              onClick={() => window.location.reload()} 
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

  const isOnSale = product.compare_price && product.compare_price > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-primary">Home</a></li>
            <li>/</li>
            <li><a href={`/category/${product.category.id}`} className="hover:text-primary">{product.category.name}</a></li>
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.url)}
                    className={`aspect-square bg-card rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === image.url ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category.name}</Badge>
                {product.brand && <Badge variant="outline">{product.brand.name}</Badge>}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(24 reviews)</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {isOnSale ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">${product.price}</span>
                  <span className="text-xl text-muted-foreground line-through">${product.compare_price}</span>
                  <Badge variant="destructive" className="text-sm">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">${product.price}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.track_stock ? (
                product.stock_quantity > 0 ? (
                  <span className="text-green-600 text-sm">In Stock ({product.stock_quantity} available)</span>
                ) : (
                  <span className="text-red-600 text-sm">Out of Stock</span>
                )
              ) : (
                <span className="text-green-600 text-sm">In Stock</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || product.short_description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted"
                    disabled={product.track_stock && quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={product.track_stock && product.stock_quantity === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">30-day returns</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group cursor-pointer">
                  <div className="aspect-square bg-card rounded-lg overflow-hidden mb-4">
                    <img
                      src={relatedProduct.images[0]?.url || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{relatedProduct.name}</h3>
                  <p className="text-primary font-semibold">${relatedProduct.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductDetail(props: { id: number | string }) {
  return (
    <CartProvider>
      <ProductDetailContent {...props} />
    </CartProvider>
  )
}
