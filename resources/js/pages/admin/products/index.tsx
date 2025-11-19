import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui-old/placeholder-pattern';

interface Product {
    id: number;
    name: string;
    price?: number;
    stock_quantity?: number | null;
    category?: { id?: number; name?: string } | null;
    sku?: string;
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/admin/products',
    },
];

export default function ProductsIndex() {
    // Read products from Inertia props
    const { products } = usePage().props as any;
    
    const items: Product[] = (products.data as Product[]) ?? [];
    
    console.log(items);
    const formatPrice = (value?: number) => {
        if (value == null) return '-';
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
    };

    return (
        
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Products</h2>
                    <Link href="/admin/products/create">
                        <Button className='bg-white text-primary border border-primary hover:bg-primary hover:text-white'>Create product</Button>
                    </Link>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
               
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
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((p, index) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
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
                 </div>
            </div>
        </AppLayout>
    );
}
