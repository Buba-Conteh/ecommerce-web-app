"use client"

import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

// Mock shipping data
const mockShipments = [
  {
    id: "SHIP-001",
    orderId: "ORD-1234",
    customer: "Sarah Johnson",
    destination: "New York, USA",
    carrier: "FedEx",
    trackingNumber: "FDX1234567890",
    status: "in_transit",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "SHIP-002",
    orderId: "ORD-1235",
    customer: "Emily Chen",
    destination: "Los Angeles, USA",
    carrier: "UPS",
    trackingNumber: "UPS9876543210",
    status: "delivered",
    estimatedDelivery: "2024-01-20",
  },
  {
    id: "SHIP-003",
    orderId: "ORD-1236",
    customer: "Michael Brown",
    destination: "Chicago, USA",
    carrier: "DHL",
    trackingNumber: "DHL5555555555",
    status: "pending",
    estimatedDelivery: "2024-01-28",
  },
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Shipping & Delivery</h1>
            <p className="text-muted-foreground">Manage shipments, carriers, and delivery tracking</p>
          </div>

          {/* Shipping Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting shipment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
                <Truck className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">On the way</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,202</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono text-sm">{shipment.id}</TableCell>
                      <TableCell className="font-mono text-sm">{shipment.orderId}</TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{shipment.carrier}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{shipment.trackingNumber}</TableCell>
                      <TableCell>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            shipment.status === "delivered"
                              ? "default"
                              : shipment.status === "in_transit"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {shipment.status === "delivered"
                            ? "Delivered"
                            : shipment.status === "in_transit"
                              ? "In Transit"
                              : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Track
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
