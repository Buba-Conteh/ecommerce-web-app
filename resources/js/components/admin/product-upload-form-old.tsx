import ProductForm from '@/components/admin/product-form'
import { usePage } from '@inertiajs/react'
import type { Category, Brand, Tag } from '@/components/admin/product-form'

export function ProductUploadForm() {
    // Pull categories, brands and tags from Inertia shared props if available
    const page = usePage().props as any
    const categories: Category[] = (page.categories as Category[]) ?? []
    const brands: Brand[] = (page.brands as Brand[]) ?? []
    const tags: Tag[] = (page.tags as Tag[]) ?? []

    return (
        <ProductForm
            categories={categories}
            brands={brands}
            tags={tags}
            submitLabel="Create Product"
            submitUrl="/api/admin/products"
        />
    )
}

export default ProductUploadForm
