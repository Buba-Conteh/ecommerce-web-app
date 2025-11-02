"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { orderApi } from "@/services/api"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  unit_price: string
  quantity: number
  total_price: number
  total: number
  image?: string
}

interface Order {
  id: string | number
  order_id: number
  order_number?: string
  created_at: string
  status: string
  total: number
  subtotal: number
  tax_amount: number
  shipping_amount: number
  items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[]
}

interface TransformedOrder {
  id: string | number
  order_id: number
  order_number?: string
  date: string
  status: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number | string
  }>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "shipped":
      return "bg-blue-100 text-blue-800"
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function OrdersList({ orders }: OrdersListProps) {
  // Transform orders to match component expectations
  const transformedOrders: TransformedOrder[] = orders.map((order) => ({
    id: order.id || order.order_number || order.order_id,
    order_id: order.order_id,
    order_number: order.order_number,
    date: order.created_at,
    status: order.status,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price || (item.total_price / item.quantity)
    }))
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Track your recent purchases and order status</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => orderApi.refreshOrders()}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transformedOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transformedOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">Order ({order.order_number || order.id})</p>
                    <p className="text-sm text-slate-600">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'Date unavailable'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </Badge>
                    <p className="font-medium mt-1">${order.total}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>${Number(item.price).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items found</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => orderApi.viewOrder(order.order_id || Number(order.id))}
                  >
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
