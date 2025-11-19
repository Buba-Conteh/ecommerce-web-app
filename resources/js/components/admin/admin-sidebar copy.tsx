import { Link } from '@inertiajs/react'
import { type ReactNode } from 'react'

export function AdminSidebar() {
    // Lightweight sidebar used by admin pages — keep simple and consistent with app styles
    const items: { title: string; href: string }[] = [
        { title: 'Dashboard', href: '/admin' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Orders', href: '/admin/orders' },
        { title: 'Customers', href: '/admin/customers' },
        { title: 'Analytics', href: '/admin/analytics' },
        { title: 'Settings', href: '/admin/settings' },
    ]

    return (
        <aside className="w-64 border-r border-border bg-card/50 p-4">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">Admin</h3>
            </div>

            <nav className="flex flex-col gap-2">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
        </aside>
    )
}

export default AdminSidebar
