"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Package, ArrowLeft } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

interface Order {
  id: number
  order_number: string
  status: string
  total: number
  created_at: string
}

interface OrderConfirmationPageProps {
  order?: Order
  [key: string]: any
}

export default function OrderConfirmationPage() {
  const { order } = usePage<OrderConfirmationPageProps>().props
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const orderId = params.get('order') || order?.id?.toString()

  const downloadReceipt = () => {
    const id = order?.id || orderId
    if (id) {
      window.open(`/orders/${id}/receipt/download`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif mb-2">
                Thank you for your order!
              </CardTitle>
              <p className="text-muted-foreground">
                {order
                  ? `Your order #${order.order_number} has been confirmed and is being processed.`
                  : orderId
                  ? `Your order #${orderId} has been received.`
                  : 'Your order has been received.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {order && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-semibold">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold capitalize">{order.status}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={downloadReceipt}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Link href="/orders" className="flex-1">
                  <Button className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
              </div>

              <Link href="/products">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>

              <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                <p>You will receive an email confirmation shortly with your order details.</p>
                <p className="mt-2">We'll notify you when your order ships!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


