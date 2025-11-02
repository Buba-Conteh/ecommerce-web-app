"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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

interface ProductGridProps {
  title?: string
  subtitle?: string
  products: Product[]
  showFilters?: boolean
  showLoadMore?: boolean
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  onQuickView?: (productId: string) => void
}

export function ProductGrid({
  title = "Featured Products",
  subtitle = "Handpicked pieces that define contemporary luxury and timeless appeal",
  products,
  showFilters = true,
  showLoadMore = true,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
}: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortBy, setSortBy] = useState("featured")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [visibleCount, setVisibleCount] = useState(6)

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Assuming newer products have higher IDs
        filtered = [...filtered].sort((a, b) => b.id.localeCompare(a.id))
        break
      default:
        // Keep original order for "featured"
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, sortBy])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length

  return (
    <section className="py-20 px-10">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h3 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">{title}</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer capitalize ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All Products" : category}
                </Badge>
              ))}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {showLoadMore && hasMore && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              onClick={() => setVisibleCount((prev) => prev + 6)}
            >
              Load More Products
            </Button>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}
