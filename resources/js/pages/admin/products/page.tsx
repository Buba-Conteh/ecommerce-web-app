"use client"

import { useState } from "react"
import { usePage } from "@inertiajs/react"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CartProvider } from "@/components/cart-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductUploadForm } from "@/components/admin/product-upload-form"
import { ProductManagementTable } from "@/components/admin/product-management-table"
import { Package, Upload } from 'lucide-react'

interface ProductsPageProps {
  products?: {
    data: any[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  } | any[]
  categories?: Array<{ id: number; name: string }>
  brands?: Array<{ id: number; name: string }>
  tags?: Array<{ id: number; name: string }>
  [key: string]: any
}

function ProductsPageContent() {
  const [activeTab, setActiveTab] = useState("manage")
  const page = usePage<ProductsPageProps>()
  
  // Extract products array from pagination object
  const productsData = page.props.products
  const products = Array.isArray(productsData) 
    ? productsData 
    : productsData?.data || []
  const categories = page.props.categories || []
  const brands = page.props.brands || []
  const tags = page.props.tags || []

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your products, upload new items, and track inventory</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Manage Products
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Product
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductManagementTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductUploadForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
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
