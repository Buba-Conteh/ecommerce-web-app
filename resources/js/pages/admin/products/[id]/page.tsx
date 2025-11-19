import { Header } from '@/components/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { usePage, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ProductViewPage() {
    const page = usePage().props as any
    const product = page.product as any
    const orders = (page.orders as any[]) ?? []

    if (!product) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex">
                    <AdminSidebar />
                    <main className="flex-1 p-8">
                        <p className="text-muted-foreground">Product not found.</p>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-6">
                        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                        <p className="text-muted-foreground">{product.short_description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-2"><strong>Price: </strong>
                                        {product.price != null ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price) : '-'}</p>
                                    <p className="mb-2"><strong>SKU: </strong>{product.sku ?? '-'}</p>
                                    <p className="mb-2"><strong>Stock: </strong>{product.stock_quantity ?? '-'}</p>
                                    <p className="mb-2"><strong>Category: </strong>{product.category?.name ?? '-'}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(product.images ?? []).map((img: any, i: number) => (
                                            <div key={i} className="overflow-hidden rounded-lg border">
                                                <img src={img.url || img.image_path} alt={img.alt_text ?? product.name ?? 'Product image'} className="w-full h-40 object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <aside className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Meta</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-2"><strong>Created:</strong> {product.created_at ?? '-'}</p>
                                    <p className="mb-2"><strong>Updated:</strong> {product.updated_at ?? '-'}</p>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Orders containing this product</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-20">Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="w-28">Qty</TableHead>
                                            <TableHead className="w-32">Total</TableHead>
                                            <TableHead className="w-32">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No orders found</TableCell>
                                            </TableRow>
                                        )}

                                        {orders.map((o: any) => (
                                            <TableRow key={o.id}>
                                                <TableCell>{o.id}</TableCell>
                                                <TableCell>{o.customer?.name ?? (o.customer_email ?? '-')}</TableCell>
                                                <TableCell>{o.quantity ?? '-'}</TableCell>
                                                <TableCell>{o.total != null ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(o.total) : '-'}</TableCell>
                                                <TableCell><Badge>{o.status ?? '—'}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
