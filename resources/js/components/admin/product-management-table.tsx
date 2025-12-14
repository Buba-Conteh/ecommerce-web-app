import { usePage, Link } from '@inertiajs/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Product {
    id: number
    name: string
    status: string
    price?: number
    stock_quantity?: number | null
    sku?: string
    category?: { id?: number; name?: string } | null
    images?: Array<{
        id: number
        image_path: string
        is_primary: boolean
    }>
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
                    <TableHead className="w-16">Product</TableHead>
                    {/* <TableHead>Name</TableHead> */}
                    <TableHead className="w-32">Price</TableHead>
                    <TableHead className="w-28">Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
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

                {products.map((p, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-4 min-w-[300px]">
                            {p.images && p.images.length > 0 ? (

                                <img
                                    src={'/'+p.images[0].image_path}
                                    alt={p.name}
                                    className="w-10 h-10 object-cover rounded-md"
                                    />
                              
                                    
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-md text-xs text-muted-foreground">No Image</div>
                                )}
                              <div className="flex flex-col">
                                <span className="truncate max-w-[300px]">{p.name}</span>
                                {p.sku && <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>}
                            </div>
                                </div>
                        </TableCell>

                        {/* <TableCell>
                            <div className="flex flex-col">
                                <span className="truncate max-w-[300px]">{p.name}</span>
                                {p.sku && <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>}
                            </div>
                        </TableCell> */}
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
                            {typeof p.status === 'number' ? (
                                p.status > 0 ? (
                                    <Badge variant="secondary">{p.status}</Badge>
                                ) : (
                                    <Badge variant="destructive">Out</Badge>
                                )
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </TableCell>
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
