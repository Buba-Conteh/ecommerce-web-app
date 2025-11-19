import { Header } from '@/components/header'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import ProductUploadForm from '@/components/admin/product-upload-form'

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="mb-8">
                        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Create Product</h1>
                        <p className="text-muted-foreground">Add a new product to the catalogue</p>
                    </div>

                    <ProductUploadForm />
                </main>
            </div>
        </div>
    )
}
