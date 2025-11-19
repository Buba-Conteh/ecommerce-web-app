"use client"

import { usePage } from '@inertiajs/react';
import { Header } from '@/components/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { CartProvider } from '@/components/cart-provider';
import ProductForm from '@/components/admin/product-form';
import type { Category, Brand, Tag } from '@/components/admin/product-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function CreateProductContent() {
    const { categories, brands, tags } = usePage().props as any;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Create New Product</h1>
                        <p className="text-muted-foreground">Add a new product to your catalog</p>
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
                                submitLabel="Create Product"
                                submitUrl="/api/admin/products"
                            />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

export default function CreateProduct() {
    return (
        <CartProvider>
            <CreateProductContent />
        </CartProvider>
    );
}
