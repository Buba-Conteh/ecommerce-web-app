"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Search, Filter, X } from "lucide-react"
import { Link, router, usePage } from "@inertiajs/react"
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

interface Category {
  id: number
  name: string
  products_count: number
}

interface Brand {
  id: number
  name: string
  products_count: number
}

interface ProductsPageProps {
  products: {
    data: Product[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  categories: Category[]
  brands: Brand[]
  filters: {
    search?: string
    category?: string
    brand?: string
    min_price?: number
    max_price?: number
    in_stock?: boolean
    on_sale?: boolean
    sort?: string
  }
}

function ProductsPageContent() {
  const { state, addToCart } = useCart()
  const { products, categories, brands, filters } = usePage<ProductsPageProps>().props

  const [search, setSearch] = useState(filters.search || "")
  const [selectedCategory, setSelectedCategory] = useState(filters.category || "")
  const [selectedBrand, setSelectedBrand] = useState(filters.brand || "")
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.min_price || 0,
    filters.max_price || 1000
  ])
  const [inStock, setInStock] = useState(filters.in_stock || false)
  const [onSale, setOnSale] = useState(filters.on_sale || false)
  const [sort, setSort] = useState("latest")
  const [showFilters, setShowFilters] = useState(false)

  const applyFilters = () => {
    const params: any = {}
    
    if (search) params.search = search
    if (selectedCategory) params.category = selectedCategory
    if (selectedBrand) params.brand = selectedBrand
    if (priceRange[0] > 0) params.min_price = priceRange[0]
    if (priceRange[1] < 1000) params.max_price = priceRange[1]
    if (inStock) params.in_stock = true
    if (onSale) params.on_sale = true
    if (sort !== "latest") params.sort = sort

    router.get("/products", params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("")
    setSelectedBrand("")
    setPriceRange([0, 1000])
    setInStock(false)
    setOnSale(false)
    setSort("latest")
    router.get("/products")
  }

  const handleAddToCart = async (productId: string) => {
    const product = products.data.find((p: Product) => p.id === parseInt(productId))
    if (product) {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        image: product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.svg',
      })
    }
  }

  const handleAddToWishlist = (productId: string) => {
    console.log("Adding to wishlist:", productId)
  }

  const handleQuickView = (productId: string) => {
    router.visit(`/products/${productId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Shop</h1>
          <p className="text-muted-foreground">Discover our curated collection</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button onClick={applyFilters}>Apply</Button>
              {(selectedCategory || selectedBrand || search || inStock || onSale) && (
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name} ({cat.products_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand</label>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Brands</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name} ({brand.products_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Options</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="in_stock"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="in_stock" className="text-sm">In Stock Only</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="on_sale"
                        checked={onSale}
                        onChange={(e) => setOnSale(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="on_sale" className="text-sm">On Sale</label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {products.data.length} of {products.total} products
            </p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {products.data.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.data.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    originalPrice: product.compare_price,
                    image: product.images.find(img => img.is_primary)?.url || product.images[0]?.url || '/placeholder.svg',
                    rating: 4.5,
                    reviewCount: 0,
                    isOnSale: !!(product.compare_price && product.compare_price > product.price),
                    category: product.category.name
                  }}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>

            {/* Pagination */}
            {products.last_page > 1 && (
              <div className="flex justify-center gap-2">
                {products.current_page > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => router.get(`/products?page=${products.current_page - 1}`, {}, { preserveState: true })}
                  >
                    Previous
                  </Button>
                )}
                {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === products.current_page ? "default" : "outline"}
                    onClick={() => router.get(`/products?page=${page}`, {}, { preserveState: true })}
                  >
                    {page}
                  </Button>
                ))}
                {products.current_page < products.last_page && (
                  <Button
                    variant="outline"
                    onClick={() => router.get(`/products?page=${products.current_page + 1}`, {}, { preserveState: true })}
                  >
                    Next
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found</p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <CartProvider>
      <ProductsPageContent />
    </CartProvider>
  )
}

