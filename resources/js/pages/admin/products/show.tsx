"use client"

import { Link, usePage } from '@inertiajs/react';
import { Header } from '@/components/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { CartProvider } from '@/components/cart-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { ArrowLeft, Package } from 'lucide-react';

interface ProductImage {
    id: number;
    image_path?: string;
    url?: string;
    is_primary: boolean;
    alt_text?: string;
}

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface OrderItem {
    id: number;
    order_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_name: string;
    created_at: string;
    order?: {
        id: number;
        order_number: string;
        customer?: {
            name: string;
            email: string;
        };
        status: string;
        total: number;
        created_at: string;
    };
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    compare_price?: number;
    cost_price?: number;
    sku: string;
    barcode?: string;
    stock_quantity: number;
    min_stock_quantity: number;
    track_stock: boolean;
    is_active: boolean;
    is_featured: boolean;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    category?: Category;
    brand?: Brand;
    tags?: Tag[];
    images?: ProductImage[];
    orderItems?: OrderItem[];
    created_at: string;
    updated_at: string;
}

function ProductViewContent() {
    const { product } = usePage().props as any;
    const p: Product = product || {};

    const formatPrice = (value?: number) => {
        if (value == null) return '-';
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
            value
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const primaryImage = p.images?.find((img) => img.is_primary);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/admin/products">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="font-serif text-4xl font-bold text-foreground">{p.name || 'Product'}</h1>
                                    {p.sku && <p className="text-muted-foreground">SKU: {p.sku}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href={`/admin/products/${p.id}/edit`}>
                                    <Button variant="outline">Edit</Button>
                                </Link>
                                <Button variant={p.is_active ? 'secondary' : 'destructive'}>
                                    {p.is_active ? 'Active' : 'Inactive'}
                                </Button>
                            </div>
                        </div>
                    </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Main Details */}
                    <div className="md:col-span-2 space-y-4">
                        {p.images && p.images.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4">
                                        {primaryImage && (
                                            <div className="aspect-square overflow-hidden rounded-lg border border-border">
                                                <img
                                                    src={primaryImage.image_path ? `/storage/${primaryImage.image_path}` : primaryImage.url || '/placeholder.svg'}
                                                    alt={p.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        {p.images.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {p.images.map((img) => (
                                                    <div
                                                        key={img.id}
                                                        className="relative aspect-square overflow-hidden rounded border border-border"
                                                    >
                                                        <img
                                                            src={img.image_path ? `/storage/${img.image_path}` : img.url || '/placeholder.svg'}
                                                            alt={img.alt_text || 'Product'}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        {img.is_primary && (
                                                            <Badge className="absolute left-1 top-1">
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {p.short_description && (
                                    <div>
                                        <h4 className="font-semibold">Short Description</h4>
                                        <p className="text-sm text-muted-foreground">{p.short_description}</p>
                                    </div>
                                )}
                                {p.description && (
                                    <div>
                                        <h4 className="font-semibold">Full Description</h4>
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                            {p.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                                        <p className="text-lg font-semibold">{formatPrice(p.price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Compare Price</p>
                                        <p className="text-lg font-semibold">
                                            {p.compare_price ? formatPrice(p.compare_price) : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cost Price</p>
                                        <p className="text-lg font-semibold">
                                            {p.cost_price ? formatPrice(p.cost_price) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Orders History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Order History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {p.orderItems && p.orderItems.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order #</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Unit Price</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {p.orderItems.map((item: OrderItem) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        {item.order?.order_number || `Order #${item.order_id}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.order?.customer?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{formatPrice(item.unit_price)}</TableCell>
                                                    <TableCell>{formatPrice(item.total_price)}</TableCell>
                                                    <TableCell>{formatDate(item.created_at)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {item.order?.status || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No orders for this product yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Stock Quantity</p>
                                    <p className="text-2xl font-semibold">
                                        {p.track_stock ? p.stock_quantity : 'Not tracked'}
                                    </p>
                                </div>
                                {p.track_stock && p.min_stock_quantity && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Min Stock</p>
                                        <p className="text-lg">{p.min_stock_quantity}</p>
                                    </div>
                                )}
                                {p.track_stock && (
                                    <div>
                                        <Badge
                                            variant={p.stock_quantity > 0 ? 'secondary' : 'destructive'}
                                        >
                                            {p.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Category & Brand */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category & Brand</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {p.category && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                                        <p className="font-medium">{p.category.name}</p>
                                    </div>
                                )}
                                {p.brand && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Brand</p>
                                        <p className="font-medium">{p.brand.name}</p>
                                    </div>
                                )}
                                {p.tags && p.tags.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tags</p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {p.tags.map((tag) => (
                                                <Badge key={tag.id} variant="outline">
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Shipping */}
                        {(p.weight || p.length || p.width || p.height) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipping</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {p.weight && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Weight</span>
                                            <span className="font-medium">{p.weight} kg</span>
                                        </div>
                                    )}
                                    {p.length && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Length</span>
                                            <span className="font-medium">{p.length} cm</span>
                                        </div>
                                    )}
                                    {p.width && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Width</span>
                                            <span className="font-medium">{p.width} cm</span>
                                        </div>
                                    )}
                                    {p.height && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Height</span>
                                            <span className="font-medium">{p.height} cm</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Created</p>
                                    <p className="text-sm font-medium">{formatDate(p.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Last Updated</p>
                                    <p className="text-sm font-medium">{formatDate(p.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </main>
            </div>
        </div>
    );
}

export default function ProductView() {
    return (
        <CartProvider>
            <ProductViewContent />
        </CartProvider>
    );
}
