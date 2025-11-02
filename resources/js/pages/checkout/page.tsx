"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { orderApi } from "@/services/api"

export default function CheckoutPage() {
	const { state, clearCart } = useCart()
	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		address_line_1: "",
		city: "",
		state: "",
		postal_code: "",
		country: "",
	})
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const totals = useMemo(() => {
		const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
		const tax = Math.round(subtotal * 0.1 * 100) / 100
		const shipping = subtotal > 100 ? 0 : 9.99
		const total = Math.round((subtotal + tax + shipping) * 100) / 100
		return { subtotal, tax, shipping, total }
	}, [state.items])

	const submitOrder = async () => {
		setSubmitting(true)
		setError(null)
		try {
			const result = await orderApi.createGuestOrder({
				customer: form,
				items: state.items.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
			})
			clearCart()
			const orderId = result?.order?.id
			const redirectUrl = orderId ? `/orders/confirmation?order=${orderId}` : '/orders'
			window.location.href = redirectUrl
		} catch (e) {
			console.error(e)
			setError("Failed to place order. Please try again.")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					<h1 className="text-3xl font-bold">Checkout</h1>
					{error && <div className="text-red-600 text-sm">{error}</div>}
					<div className="bg-card border rounded-lg p-6 space-y-4">
						<h2 className="text-xl font-semibold">Contact & Shipping</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<Input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
							<Input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
							<Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
							<Input placeholder="Address" className="md:col-span-2" value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} />
							<Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
							<Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
							<Input placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
							<Input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="bg-card border rounded-lg py-5">
						<h2 className="text-xl font-semibold mb-4">Order Summary</h2>
						{state.items.map((i) => (
							<div key={i.id} className="flex justify-between text-sm mb-2">
								<span>
									{i.name} × {i.quantity}
								</span>
								<span>${(i.price * i.quantity).toFixed(2)}</span>
							</div>
						))}
						<Separator className="my-3" />
						<div className="flex justify-between text-sm"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
						<div className="flex justify-between text-sm"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
						<div className="flex justify-between text-sm"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}</span></div>
						<Separator className="my-3" />
						<div className="flex justify-between font-semibold"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
						<Button className="w-full mt-4" disabled={submitting || state.items.length === 0} onClick={submitOrder}>
							{submitting ? "Placing order..." : "Place Order"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}


