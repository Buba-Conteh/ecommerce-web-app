"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { router, usePage } from "@inertiajs/react"

interface Product {
  id: number
  name: string
  sku: string
  stock_quantity: number
  min_stock_quantity: number
  cost_price: number
  price: number
  category: {
    id: number
    name: string
  }
  brand: {
    id: number
    name: string
  }
  images: Array<{ url: string }>
}

interface InventoryPageProps {
  products: {
    data: Product[]
    current_page: number
    last_page: number
    total: number
  }
  stats: {
    total_products: number
    low_stock: number
    out_of_stock: number
    in_stock: number
    total_value: number
  }
  filters: {
    stock_status?: string
    search?: string
  }
}

export default function AdminInventoryPage() {
  const { products, stats, filters } = usePage<InventoryPageProps>().props

  const [search, setSearch] = useState(filters.search || "")
  const [stockStatus, setStockStatus] = useState(filters.stock_status || "")
  const [editingStock, setEditingStock] = useState<number | null>(null)
  const [stockValue, setStockValue] = useState<string>("")

  const applyFilters = () => {
    const params: any = {}
    if (search) params.search = search
    if (stockStatus) params.stock_status = stockStatus

    router.get("/admin/inventory", params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleEditStock = (product: Product) => {
    setEditingStock(product.id)
    setStockValue(product.stock_quantity.toString())
  }

  const handleSaveStock = (productId: number) => {
    router.put(`/admin/inventory/${productId}/stock`, {
      stock_quantity: parseInt(stockValue)
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingStock(null)
        setStockValue("")
      }
    })
  }

  const handleCancelEdit = () => {
    setEditingStock(null)
    setStockValue("")
  }

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return { label: "Out of Stock", variant: "destructive" }
    }
    if (product.stock_quantity <= product.min_stock_quantity) {
      return { label: "Low Stock", variant: "warning" }
    }
    return { label: "In Stock", variant: "success" }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Track and manage product stock levels</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_products}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.in_stock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.low_stock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
                <XCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_value.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                    className="pl-10"
                  />
                </div>

                <Select value={stockStatus} onValueChange={setStockStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stock Status</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock Quantity</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.data.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const isEditing = editingStock === product.id

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.url || '/placeholder.svg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.sku || 'N/A'}</TableCell>
                        <TableCell>{product.category.name}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={stockValue}
                              onChange={(e) => setStockValue(e.target.value)}
                              className="w-20"
                              min="0"
                            />
                          ) : (
                            <span className="font-medium">{product.stock_quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>{product.min_stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>${product.cost_price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveStock(product.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditStock(product)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {products.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {products.current_page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => router.get(`/admin/inventory?page=${products.current_page - 1}`, {}, { preserveState: true })}
                    >
                      Previous
                    </Button>
                  )}
                  {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === products.current_page ? "default" : "outline"}
                      onClick={() => router.get(`/admin/inventory?page=${page}`, {}, { preserveState: true })}
                    >
                      {page}
                    </Button>
                  ))}
                  {products.current_page < products.last_page && (
                    <Button
                      variant="outline"
                      onClick={() => router.get(`/admin/inventory?page=${products.current_page + 1}`, {}, { preserveState: true })}
                    >
                      Next
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

