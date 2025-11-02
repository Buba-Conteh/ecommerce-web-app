"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"

export default function OrderConfirmationPage() {
	const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
	const orderId = params.get('order')

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-16 text-center">
				<h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
				<p className="text-muted-foreground mb-6">
					Your order{orderId ? ` #${orderId}` : ''} has been received.
				</p>
				<div className="flex gap-3 justify-center">
					<Button onClick={() => (window.location.href = '/orders')}>View orders</Button>
					<Button variant="outline" onClick={() => (window.location.href = '/')}>Continue shopping</Button>
				</div>
			</div>
		</div>
	)
}


