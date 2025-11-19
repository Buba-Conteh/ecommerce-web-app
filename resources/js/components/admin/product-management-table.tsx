import { usePage, Link } from '@inertiajs/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Product {
    id: number
    name: string
    price?: number
    stock_quantity?: number | null
    sku?: string
    category?: { id?: number; name?: string } | null
}

export function ProductManagementTable() {
    const page = usePage().props as any
    
    // Handle both pagination object and plain array
    const productsData = page.products
    const products: Product[] = Array.isArray(productsData) 
        ? productsData 
        : productsData?.data || []

    const formatPrice = (value?: number) => {
        if (value == null) return '-'
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-32">Price</TableHead>
                    <TableHead className="w-28">Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-40">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {products.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                            No products found.
                        </TableCell>
                    </TableRow>
                )}

                {products.map((p) => (
                    <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.id}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="truncate max-w-[420px]">{p.name}</span>
                                {p.sku && <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>}
                            </div>
                        </TableCell>
                        <TableCell>{formatPrice(p.price)}</TableCell>
                        <TableCell>
                            {typeof p.stock_quantity === 'number' ? (
                                p.stock_quantity > 0 ? (
                                    <Badge variant="secondary">{p.stock_quantity}</Badge>
                                ) : (
                                    <Badge variant="destructive">Out</Badge>
                                )
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </TableCell>
                        <TableCell>{p.category?.name ?? '-'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Link href={`/admin/products/${p.id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                </Link>
                                <Link href={`/admin/products/${p.id}/edit`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </Link>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default ProductManagementTable
