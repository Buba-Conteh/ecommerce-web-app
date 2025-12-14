"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, ArrowLeft, Truck } from "lucide-react"
import { Link, router, usePage } from "@inertiajs/react"
import { useCart } from "@/components/cart-provider"
import { CartProvider } from "@/components/cart-provider"

function OrderPageContent() {
  const { state, clearCart } = useCart()
  const { flash } = usePage().props
  
  const [alert, setAlert] =  useState<Record<string, string | string[]>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | string[]>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
    card_name: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const fieldError = (field: string) => {
    const snake = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    const message = errors[field] ?? errors[snake]
    if (Array.isArray(message)) return message[0]
    return message
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    setIsProcessing(true)

    const taxAmount = Number((state.total || 0) * 0.08)
    const grandTotal = Number((state.total || 0) + taxAmount)

    const payload = {
      ...formData,
      items: state.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      subtotal: state.total,
      tax_amount: taxAmount,
      total: grandTotal
    }

    router.post(
      "/orders",
      payload as any,
      {
        preserveScroll: true,
        onSuccess: () => {
          setOrderComplete(true)
          setSubmitSuccess(true)
          clearCart()
          setErrors({})
        },
        onError: (errs) => {
          setErrors(errs)
        },
        onFinish: () => setIsProcessing(false)
      }
    )
  }

  // Check if cart has items
  if (!state.items || state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-serif text-slate-800">Your Cart is Empty</CardTitle>
            <CardDescription>
            {submitSuccess && (
                    <div className="alert">Order created susessfully</div>
                    )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 py-4">
            <Button asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-serif text-slate-800">Order Confirmed!</CardTitle>
            <CardDescription>Thank you for your purchase. You'll receive a confirmation email shortly.</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/user/profile">View Order History</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-20 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Complete Your Order</h1>
          <div className="mt-2 text-slate-600">
            <p>Cart Total: <span className="font-semibold">${state.total.toFixed(2) || "0.00"}</span> • {state.items.reduce((sum, item) => sum + item.quantity, 0) || 0} items</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <Card className="py-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      aria-invalid={!!fieldError("first_name")}
                      required
                    />
                    {fieldError("first_name") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("first_name")}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      aria-invalid={!!fieldError("last_name")}
                      required
                    />
                    {fieldError("last_name") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("last_name")}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    aria-invalid={!!fieldError("email")}
                    required
                  />
                  {fieldError("email") && (
                    <p className="text-sm text-red-500 mt-1">{fieldError("email")}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    aria-invalid={!!fieldError("address")}
                    required
                  />
                  {fieldError("address") && (
                    <p className="text-sm text-red-500 mt-1">{fieldError("address")}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      aria-invalid={!!fieldError("city")}
                      required
                    />
                    {fieldError("city") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("city")}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                      aria-invalid={!!fieldError("postal_code")}
                      required
                    />
                    {fieldError("postalCode") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("postal_code")}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldError("country") && (
                    <p className="text-sm text-red-500 mt-1">{fieldError("country")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="py-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Your payment information is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    value={formData.card_name}
                    onChange={(e) => handleInputChange("card_name", e.target.value)}
                    aria-invalid={!!fieldError("card_name")}
                    required
                  />
                  {fieldError("card_name") && (
                    <p className="text-sm text-red-500 mt-1">{fieldError("card_name")}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.card_number}
                    onChange={(e) => handleInputChange("card_number", e.target.value)}
                    aria-invalid={!!fieldError("card_number")}
                    required
                  />
                  {fieldError("card_number") && (
                    <p className="text-sm text-red-500 mt-1">{fieldError("card_number")}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiry_date}
                      onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                      aria-invalid={!!fieldError("expiry_date")}
                      required
                    />
                    {fieldError("expiry_date") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("expiry_date")}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      aria-invalid={!!fieldError("cvv")}
                      required
                    />
                    {fieldError("cvv") && (
                      <p className="text-sm text-red-500 mt-1">{fieldError("cvv")}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8 py-5">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <p className="text-sm">Subtotal</p>
                  <p className="text-sm">${state.total.toFixed(2) || "0.00"}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Shipping</p>
                  <p className="text-sm">Free</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Tax</p>
                  <p className="text-sm">${((state.total || 0) * 0.08).toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <p>Total</p>
                  <p>${((state.total || 0) * 1.08).toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} className="w-full" disabled={isProcessing || !state.items.length}>
                  {isProcessing ? "Processing..." : `Complete Order - $${((state.total || 0) * 1.08).toFixed(2)}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
                 </div>
       </div>
     </div>
   )
 }

export default function OrderPage() {
  return (
    <CartProvider>
      <OrderPageContent />
    </CartProvider>
  )
}
