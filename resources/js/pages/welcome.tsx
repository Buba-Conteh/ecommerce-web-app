"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSlider } from "@/components/hero-slider"
import { ProductGrid } from "@/components/product-grid"
import { CartProvider, useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Link } from "@inertiajs/react"
import { cartApi } from "@/services/api"

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

interface WelcomeProps {
  featuredProducts: Product[]
}



function EcommerceContent({ featuredProducts }: WelcomeProps) {
  const { state, addToCart } = useCart()
  const [products] = useState<Product[]>(featuredProducts)

  const handleAddToCart = async (productId: string) => {
    try {
      const product = products.find((p: Product) => p.id === parseInt(productId))
      if (product) {
        addToCart({
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          image: product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.svg',
        })

        // For guests, keep cart front-end only (do not call backend)
      }
    } catch (err) {
      console.error('Failed to add to cart:', err)
      // You might want to show a toast notification here
    }
  }

  const handleAddToWishlist = async (productId: string) => {
    // TODO: Implement wishlist API call to Laravel
    console.log("Adding to wishlist:", productId)
  }

  const handleQuickView = (productId: string) => {
    // TODO: Open product quick view modal
    console.log("Quick view:", productId)
  }

  console.log(products)
  return (
    <div className="min-h-screen bg-background ">
      <Header />

      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Products Grid */}
      <ProductGrid
        products={products.map(product => ({
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          originalPrice: product.compare_price,
          image: product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.svg',
          rating: 4.5, // Default rating - you can add this to your Product model
          reviewCount: 24, // Default review count - you can add this to your Product model
          isOnSale: !!(product.compare_price && product.compare_price > product.price),
          category: product.category.name
        }))}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onQuickView={handleQuickView}
        
      />

      {/* Promotional Banner */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="font-serif text-3xl lg:text-4xl font-bold text-primary-foreground">Limited Time Offer</h3>
            <p className="text-lg text-primary-foreground/90">
              Get 30% off on all premium collections. Elevate your wardrobe with pieces that define sophistication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="bg-card text-primary hover:bg-card/90">
                  Shop Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="font-serif text-xl font-bold text-primary">Luxe</h4>
              <p className="text-muted-foreground">
                Defining luxury through timeless design and exceptional craftsmanship.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-foreground">Shop</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Collections
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Sale
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Gift Cards
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-foreground">Support</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Shipping
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium text-foreground">Connect</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pinterest
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Luxe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function EcommerceInspiration({ featuredProducts }: WelcomeProps) {
  return (
    <CartProvider>
      <EcommerceContent featuredProducts={featuredProducts} />
    </CartProvider>
  )
}
