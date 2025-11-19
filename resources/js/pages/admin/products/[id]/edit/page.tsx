import { Header } from '@/components/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import ProductForm from '@/components/admin/product-form'
import { usePage } from '@inertiajs/react'

export default function EditProductPage() {
    const page = usePage().props as any
    const product = page.product as any
    const categories = (page.categories as any[]) ?? []
    const brands = (page.brands as any[]) ?? []
    const tags = (page.tags as any[]) ?? []

    const initialData = product
        ? {
              id: product.id,
              name: product.name ?? '',
              description: product.description ?? '',
              short_description: product.short_description ?? '',
              price: product.price?.toString() ?? '',
              compare_price: product.compare_price?.toString() ?? '',
              cost_price: product.cost_price?.toString() ?? '',
              sku: product.sku ?? '',
              barcode: product.barcode ?? '',
              stock_quantity: product.stock_quantity?.toString() ?? '',
              min_stock_quantity: product.min_stock_quantity?.toString() ?? '5',
              track_stock: !!product.track_stock,
              is_active: !!product.is_active,
              is_featured: !!product.is_featured,
              weight: product.weight?.toString() ?? '',
              length: product.length?.toString() ?? '',
              width: product.width?.toString() ?? '',
              height: product.height?.toString() ?? '',
              category_id: product.category_id?.toString() ?? '',
              brand_id: product.brand_id?.toString() ?? '',
              tags: (product.tags ?? []).map((t: any) => t.id),
              images: product.images ?? [],
          }
        : undefined

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Edit Product</h1>
                        <p className="text-muted-foreground">Update product details</p>
                    </div>

                    <ProductForm
                        initialData={initialData}
                        categories={categories}
                        brands={brands}
                        tags={tags}
                        submitLabel="Save changes"
                        submitUrl="/api/admin/products"
                    />
                </main>
            </div>
        </div>
    )
}
