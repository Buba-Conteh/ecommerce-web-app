"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle } from "lucide-react"
import { useCart, CartProvider } from "@/components/cart-provider"
import { router, usePage } from "@inertiajs/react"
import { AddressSelector } from "@/components/checkout/address-selector"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PaymentMethod = "stripe" | "paypal"

interface Address {
  id: number
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default?: boolean
  type?: string
}

interface CheckoutPageProps {
  user?: {
    id: number
    name: string
    email: string
    customer?: {
      id: number
      first_name: string
      last_name: string
      email: string
      phone?: string
      addresses: Address[]
    }
  }
  [key: string]: any
}

interface AddressFormData {
  first_name: string
  last_name: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

function CheckoutPageContent() {
  const { state, clearCart } = useCart()
  const { user } = usePage<CheckoutPageProps>().props
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe")
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<number | null>(null)
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(null)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [shippingForm, setShippingForm] = useState<AddressFormData>({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
  })
  const [billingForm, setBillingForm] = useState<AddressFormData>({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
  })
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Prefill form data for logged-in users
  useEffect(() => {
    if (user?.customer) {
      const customer = user.customer
      const defaultShipping = customer.addresses?.find((a) => a.is_default && a.type === "shipping") || customer.addresses?.[0]
      const defaultBilling = customer.addresses?.find((a) => a.is_default && a.type === "billing") || customer.addresses?.[0]

      if (defaultShipping) {
        setSelectedShippingAddressId(defaultShipping.id)
        setShippingForm({
          first_name: defaultShipping.first_name,
          last_name: defaultShipping.last_name,
          address_line_1: defaultShipping.address_line_1,
          address_line_2: defaultShipping.address_line_2 || "",
          city: defaultShipping.city,
          state: defaultShipping.state,
          postal_code: defaultShipping.postal_code,
          country: defaultShipping.country,
          phone: defaultShipping.phone || "",
        })
      } else {
        // Prefill with customer data
        setShippingForm({
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          phone: customer.phone || "",
        })
      }

      if (defaultBilling) {
        setSelectedBillingAddressId(defaultBilling.id)
        setBillingForm({
          first_name: defaultBilling.first_name,
          last_name: defaultBilling.last_name,
          address_line_1: defaultBilling.address_line_1,
          address_line_2: defaultBilling.address_line_2 || "",
          city: defaultBilling.city,
          state: defaultBilling.state,
          postal_code: defaultBilling.postal_code,
          country: defaultBilling.country,
          phone: defaultBilling.phone || "",
        })
      } else {
        setBillingForm({
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          phone: customer.phone || "",
        })
      }
    }
  }, [user])

  // Sync billing address with shipping if enabled
  useEffect(() => {
    if (useSameAddress && selectedShippingAddressId === null) {
      setBillingForm(shippingForm)
    } else if (useSameAddress && selectedShippingAddressId) {
      const address = user?.customer?.addresses?.find((a) => a.id === selectedShippingAddressId)
      if (address) {
        setBillingForm({
          first_name: address.first_name,
          last_name: address.last_name,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2 || "",
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
          phone: address.phone || "",
        })
      }
    }
  }, [useSameAddress, shippingForm, selectedShippingAddressId, user])

  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const tax = Math.round(subtotal * 0.1 * 100) / 100
    const shipping = subtotal > 100 ? 0 : 9.99
    const total = Math.round((subtotal + tax + shipping) * 100) / 100
    return { subtotal, tax, shipping, total }
  }, [state.items])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate shipping address
    if (!selectedShippingAddressId) {
      if (!shippingForm.first_name) newErrors.shipping_first_name = "First name is required"
      if (!shippingForm.last_name) newErrors.shipping_last_name = "Last name is required"
      if (!shippingForm.address_line_1) newErrors.shipping_address_line_1 = "Address is required"
      if (!shippingForm.city) newErrors.shipping_city = "City is required"
      if (!shippingForm.state) newErrors.shipping_state = "State is required"
      if (!shippingForm.postal_code) newErrors.shipping_postal_code = "Postal code is required"
      if (!shippingForm.country) newErrors.shipping_country = "Country is required"
    }

    // Validate billing address if different
    if (!useSameAddress) {
      if (!selectedBillingAddressId) {
        if (!billingForm.first_name) newErrors.billing_first_name = "First name is required"
        if (!billingForm.last_name) newErrors.billing_last_name = "Last name is required"
        if (!billingForm.address_line_1) newErrors.billing_address_line_1 = "Address is required"
        if (!billingForm.city) newErrors.billing_city = "City is required"
        if (!billingForm.state) newErrors.billing_state = "State is required"
        if (!billingForm.postal_code) newErrors.billing_postal_code = "Postal code is required"
        if (!billingForm.country) newErrors.billing_country = "Country is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setProcessing(true)
    setErrors({})

    try {
      // Prepare shipping address data
      let shippingAddressData: AddressFormData | undefined = undefined
      let shippingAddressId: number | undefined = undefined
      
      if (selectedShippingAddressId) {
        // Use existing address ID
        shippingAddressId = selectedShippingAddressId
      } else {
        // Use form data
        shippingAddressData = shippingForm
      }

      // Prepare billing address data
      let billingAddressData: AddressFormData | undefined = undefined
      let billingAddressId: number | undefined = undefined
      
      if (useSameAddress) {
        // Use same as shipping
        if (selectedShippingAddressId) {
          billingAddressId = selectedShippingAddressId
        } else {
          billingAddressData = shippingForm
        }
      } else {
        // Different billing address
        if (selectedBillingAddressId) {
          billingAddressId = selectedBillingAddressId
        } else {
          billingAddressData = billingForm
        }
      }

      const orderData: Record<string, any> = {
        items: state.items.map((i) => ({
          id: parseInt(i.id), // Convert string ID to integer for backend
          quantity: i.quantity,
          price: i.price,
          name: i.name,
        })),
        payment_method: paymentMethod,
        subtotal: totals.subtotal,
        tax_amount: totals.tax,
        shipping_amount: totals.shipping,
        total: totals.total,
      }

      // Add shipping address (either ID or data object)
      if (shippingAddressId) {
        orderData.shipping_address_id = shippingAddressId
      } else if (shippingAddressData) {
        orderData.shipping_address = shippingAddressData
      }

      // Add billing address (either ID or data object)
      if (billingAddressId) {
        orderData.billing_address_id = billingAddressId
      } else if (billingAddressData && !useSameAddress) {
        orderData.billing_address = billingAddressData
      }

      router.post("/checkout", orderData, {
        onSuccess: (page) => {
          // Clear cart after successful order
          clearCart()
          
          // The backend redirects to /orders/confirmation?order={id}
          // Inertia will automatically follow the redirect
          // No need to manually navigate
        },
        onError: (errors) => {
          setErrors(errors as Record<string, string>)
          setProcessing(false)
        },
        onFinish: () => {
          setProcessing(false)
        },
      })
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to place order. Please try again." })
      setProcessing(false)
    }
  }

  if (!state.items || state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Your Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/products">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const shippingAddresses = user?.customer?.addresses?.filter((a) => ["shipping", "both"].includes(a.type || "")) || []
  const billingAddresses = user?.customer?.addresses?.filter((a) => ["billing", "both"].includes(a.type || "")) || []

  return (
    <div className="min-h-screen px-20 bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Checkout</h1>

        {errors.submit && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            {user?.customer && shippingAddresses.length > 0 ? (
              <AddressSelector
                addresses={shippingAddresses}
                selectedAddressId={selectedShippingAddressId}
                onSelect={setSelectedShippingAddressId}
                onAddNew={() => setSelectedShippingAddressId(null)}
                type="shipping"
              />
            ) : null}

            {(!selectedShippingAddressId || !user?.customer) && (
              <AddressForm
                formData={shippingForm}
                onChange={(field, value) => setShippingForm((prev) => ({ ...prev, [field]: value }))}
                errors={{
                  first_name: errors.shipping_first_name,
                  last_name: errors.shipping_last_name,
                  address_line_1: errors.shipping_address_line_1,
                  city: errors.shipping_city,
                  state: errors.shipping_state,
                  postal_code: errors.shipping_postal_code,
                  country: errors.shipping_country,
                }}
              />
            )}

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="same-address"
                    checked={useSameAddress}
                    onChange={(e) => setUseSameAddress(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="same-address" className="text-sm cursor-pointer">
                    Same as shipping address
                  </label>
                </div>

                {!useSameAddress && (
                  <>
                    {user?.customer && billingAddresses.length > 0 ? (
                      <AddressSelector
                        addresses={billingAddresses}
                        selectedAddressId={selectedBillingAddressId}
                        onSelect={setSelectedBillingAddressId}
                        onAddNew={() => setSelectedBillingAddressId(null)}
                        type="billing"
                      />
                    ) : null}

                    {(!selectedBillingAddressId || !user?.customer) && (
                      <AddressForm
                        formData={billingForm}
                        onChange={(field, value) => setBillingForm((prev) => ({ ...prev, [field]: value }))}
                        errors={{
                          first_name: errors.billing_first_name,
                          last_name: errors.billing_last_name,
                          address_line_1: errors.billing_address_line_1,
                          city: errors.billing_city,
                          state: errors.billing_state,
                          postal_code: errors.billing_postal_code,
                          country: errors.billing_country,
                        }}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={setPaymentMethod} />
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
                  <span>{totals.shipping === 0 ? "Free" : `$${totals.shipping.toFixed(2)}`}</span>
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
                    "Complete Order"
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

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutPageContent />
    </CartProvider>
  )
}
