"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Lock, Truck, Loader2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { router } from "@inertiajs/react"

type PaymentMethod = 'stripe' | 'paypal'

interface ShippingForm {
	first_name: string
	last_name: string
	email: string
	address_line_1: string
	city: string
	state: string
	postal_code: string
	country: string
}

export default function CheckoutPage() {
	const { state, clearCart } = useCart()
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
	const [shippingForm, setShippingForm] = useState<ShippingForm>({
		first_name: "",
		last_name: "",
		email: "",
		address_line_1: "",
		city: "",
		state: "",
		postal_code: "",
		country: "",
	})
	const [processing, setProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const totals = useMemo(() => {
		const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
		const tax = Math.round(subtotal * 0.1 * 100) / 100
		const shipping = subtotal > 100 ? 0 : 9.99
		const total = Math.round((subtotal + tax + shipping) * 100) / 100
		return { subtotal, tax, shipping, total }
	}, [state.items])

	const updateShippingField = (field: keyof ShippingForm, value: string) => {
		setShippingForm(prev => ({ ...prev, [field]: value }))
	}

	const handleSubmit = async () => {
		setProcessing(true)
		setError(null)

		try {
			// First create the order
			const orderResponse = await fetch('/api/guest-checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					customer: shippingForm,
					items: state.items.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
				}),
			})

			if (!orderResponse.ok) {
				throw new Error('Failed to create order')
			}

			const orderData = await orderResponse.json()
			const order = orderData.order

			// Then process payment based on selected method
			if (paymentMethod === 'stripe') {
				await processStripePayment(order.id, totals.total)
			} else {
				await processPayPalPayment(order.id, totals.total)
			}
		} catch (e: any) {
			console.error(e)
			setError(e.message || "Failed to place order. Please try again.")
			setProcessing(false)
		}
	}

	const processStripePayment = async (orderId: number, amount: number) => {
		try {
			// Create payment intent
			const intentResponse = await fetch('/api/payments/stripe/create-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
				},
				credentials: 'same-origin',
				body: JSON.stringify({ order_id: orderId, amount }),
			})

			if (!intentResponse.ok) {
				throw new Error('Failed to initialize payment')
			}

			const intentData = await intentResponse.json()

			// Load Stripe.js and confirm payment
			const stripe = await loadStripe()

			if (!stripe) {
				throw new Error('Failed to load Stripe')
			}

			const { error: stripeError } = await stripe.confirmCardPayment(
				intentData.client_secret,
				{
					payment_method: {
						card: { token: 'card' }, // In production, you'd collect card details
						billing_details: {
							name: `${shippingForm.first_name} ${shippingForm.last_name}`,
							email: shippingForm.email,
							address: {
								line1: shippingForm.address_line_1,
								city: shippingForm.city,
								state: shippingForm.state,
								postal_code: shippingForm.postal_code,
								country: shippingForm.country,
							},
						},
					},
				}
			)

			if (stripeError) {
				throw new Error(stripeError.message)
			}

			// Confirm payment on backend
			const confirmResponse = await fetch('/api/payments/stripe/confirm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
				},
				credentials: 'same-origin',
				body: JSON.stringify({
					payment_intent_id: intentData.client_secret.split('_secret_')[0],
					order_id: orderId,
				}),
			})

			if (!confirmResponse.ok) {
				throw new Error('Failed to confirm payment')
			}

			clearCart()
			router.visit('/orders?success=payment_completed')
		} catch (error: any) {
			throw error
		}
	}

	const processPayPalPayment = async (orderId: number, amount: number) => {
		try {
			// Create PayPal order
			const createResponse = await fetch('/api/payments/paypal/create-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
				},
				credentials: 'same-origin',
				body: JSON.stringify({ order_id: orderId, amount }),
			})

			if (!createResponse.ok) {
				throw new Error('Failed to initialize PayPal payment')
			}

			const data = await createResponse.json()

			// Find approval URL from links
			const approvalLink = data.links?.find((link: any) => link.rel === 'approve')
			if (approvalLink) {
				// Redirect to PayPal for payment
				window.location.href = approvalLink.href
			} else {
				throw new Error('Failed to get PayPal approval URL')
			}
		} catch (error: any) {
			throw error
		}
	}

	const loadStripe = async () => {
		// In production, load Stripe from your publishable key
		// This is a placeholder - you'll need to load the actual Stripe.js library
		return null
	}

	// Empty cart check
	if (!state.items || state.items.length === 0) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-16">
					<Card className="max-w-md mx-auto text-center">
						<CardHeader>
							<CardTitle className="text-2xl">Your Cart is Empty</CardTitle>
							<CardDescription>Add some items to your cart before checkout.</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild className="w-full">
								<a href="/">Continue Shopping</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Checkout</h1>
				
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Checkout Form */}
					<div className="lg:col-span-2 space-y-6">
						{/* Shipping Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-5 h-5" />
									Shipping Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="first_name">First Name</Label>
										<Input
											id="first_name"
											placeholder="John"
											value={shippingForm.first_name}
											onChange={(e) => updateShippingField('first_name', e.target.value)}
											required
										/>
									</div>
									<div>
										<Label htmlFor="last_name">Last Name</Label>
										<Input
											id="last_name"
											placeholder="Doe"
											value={shippingForm.last_name}
											onChange={(e) => updateShippingField('last_name', e.target.value)}
											required
										/>
									</div>
								</div>
								<div>
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="john@example.com"
										value={shippingForm.email}
										onChange={(e) => updateShippingField('email', e.target.value)}
										required
									/>
								</div>
								<div>
									<Label htmlFor="address_line_1">Address</Label>
									<Input
										id="address_line_1"
										placeholder="123 Main St"
										value={shippingForm.address_line_1}
										onChange={(e) => updateShippingField('address_line_1', e.target.value)}
										required
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<Label htmlFor="city">City</Label>
										<Input
											id="city"
											placeholder="New York"
											value={shippingForm.city}
											onChange={(e) => updateShippingField('city', e.target.value)}
											required
										/>
									</div>
									<div>
										<Label htmlFor="state">State</Label>
										<Input
											id="state"
											placeholder="NY"
											value={shippingForm.state}
											onChange={(e) => updateShippingField('state', e.target.value)}
											required
										/>
									</div>
									<div>
										<Label htmlFor="postal_code">Postal Code</Label>
										<Input
											id="postal_code"
											placeholder="10001"
											value={shippingForm.postal_code}
											onChange={(e) => updateShippingField('postal_code', e.target.value)}
											required
										/>
									</div>
								</div>
								<div>
									<Label htmlFor="country">Country</Label>
									<Select value={shippingForm.country} onValueChange={(value) => updateShippingField('country', value)}>
										<SelectTrigger id="country">
											<SelectValue placeholder="Select country" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="US">United States</SelectItem>
											<SelectItem value="CA">Canada</SelectItem>
											<SelectItem value="GB">United Kingdom</SelectItem>
											<SelectItem value="AU">Australia</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Payment Method */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5" />
									Payment Method
								</CardTitle>
								<CardDescription className="flex items-center gap-2">
									<Lock className="w-4 h-4" />
									Your payment information is secure and encrypted
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
									<div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
										<RadioGroupItem value="stripe" id="stripe" />
										<Label htmlFor="stripe" className="flex-1 cursor-pointer">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">Credit Card</p>
													<p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
												</div>
												<CreditCard className="w-8 h-8" />
											</div>
										</Label>
									</div>
									<div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent">
										<RadioGroupItem value="paypal" id="paypal" />
										<Label htmlFor="paypal" className="flex-1 cursor-pointer">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">PayPal</p>
													<p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
												</div>
												<Paypal className="w-8 h-8 text-[#0070BA]" />
											</div>
										</Label>
									</div>
								</RadioGroup>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary */}
					<div className="space-y-6">
						<Card className="sticky top-8">
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{state.items.map((item) => (
									<div key={item.id} className="flex justify-between text-sm">
										<span>
											{item.name} × {item.quantity}
										</span>
										<span>${(item.price * item.quantity).toFixed(2)}</span>
									</div>
								))}
								<Separator />
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>${totals.subtotal.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Tax</span>
									<span>${totals.tax.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Shipping</span>
									<span>{totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}</span>
								</div>
								<Separator />
								<div className="flex justify-between font-semibold text-lg">
									<span>Total</span>
									<span>${totals.total.toFixed(2)}</span>
								</div>
							</CardContent>
							<div className="p-6 pt-0">
								<Button
									className="w-full"
									size="lg"
									disabled={processing || state.items.length === 0}
									onClick={handleSubmit}
								>
									{processing ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Processing...
										</>
									) : (
										<>Complete Order</>
									)}
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

