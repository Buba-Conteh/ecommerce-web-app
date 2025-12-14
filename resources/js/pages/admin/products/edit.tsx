"use client"

import { usePage } from '@inertiajs/react';
import { Header } from '@/components/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { CartProvider } from '@/components/cart-provider';
import ProductForm from '@/components/admin/product-form';
import type { Category, Brand, Tag, ProductFormData } from '@/components/admin/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product extends ProductFormData {
    created_at?: string;
    updated_at?: string;
    images?: Array<{
        id?: number;
        url?: string;
        image_path?: string;
        is_primary?: boolean;
        preview?: string;
        alt_text?: string;
    }>;
}

function EditProductContent() {
    const { product, categories, brands, tags } = usePage().props as any;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Edit Product</h1>
                        <p className="text-muted-foreground">{product?.name || 'Update product information'}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProductForm
                                categories={categories || []}
                                brands={brands || []}
                                tags={tags || []}
                                initialData={product}
                                submitLabel="Update Product"
                                submitUrl="/admin/products"
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

export default function EditProduct() {
    return (
        <CartProvider>
            <EditProductContent />
        </CartProvider>
    );
}
