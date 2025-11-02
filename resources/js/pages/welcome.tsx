"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { CartProvider, useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-card to-secondary py-20 lg:py-32 px-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  New Collection
                </Badge>
                <h2 className="font-serif text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Discover Your
                  <span className="text-primary block">Perfect Style</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Curated collections that blend timeless elegance with contemporary design. Experience luxury that
                  speaks to your individual style.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Shop Collection
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  View Lookbook
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    {/* <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Fashion Model</p>
                    <p className="text-sm">Hero Image Placeholder</p> */}

<img
                  src="/images/elegant-fashion-model-wearing-luxury-clothing.png"
                  alt="Hero fashion model"
                  className="w-full h-full object-cover"
                />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full border-2 border-card"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">2.5k+ Happy Customers</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                      ))}
                      <span className="text-muted-foreground ml-1">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <Button size="lg" variant="secondary" className="bg-card text-primary hover:bg-card/90">
                Shop Now
              </Button>
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
