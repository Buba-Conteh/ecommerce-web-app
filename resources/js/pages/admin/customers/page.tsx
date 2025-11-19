"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CartProvider } from "@/components/cart-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, Phone, MapPin, Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock customer data
const mockCustomers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234 567 8900",
    location: "New York, USA",
    totalSpent: 2345.67,
    orders: 12,
    segment: "VIP",
    loyaltyPoints: 2340,
    lastPurchase: "2024-01-15",
  },
  {
    id: "2",
    name: "Emily Chen",
    email: "emily.c@email.com",
    phone: "+1 234 567 8901",
    location: "Los Angeles, USA",
    totalSpent: 1234.50,
    orders: 8,
    segment: "Regular",
    loyaltyPoints: 1230,
    lastPurchase: "2024-01-20",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.b@email.com",
    phone: "+1 234 567 8902",
    location: "Chicago, USA",
    totalSpent: 567.89,
    orders: 4,
    segment: "New",
    loyaltyPoints: 560,
    lastPurchase: "2024-01-18",
  },
]

function CustomersPageContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Customer Management</h1>
            <p className="text-muted-foreground">Manage customer profiles, segments, and communications</p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Customers</TabsTrigger>
              <TabsTrigger value="vip">VIP</TabsTrigger>
              <TabsTrigger value="regular">Regular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Database</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search customers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Email All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead className="text-right">Loyalty Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {customer.location}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={customer.segment === "VIP" ? "default" : "secondary"}
                              className={customer.segment === "VIP" ? "bg-yellow-500" : ""}
                            >
                              {customer.segment === "VIP" && <Star className="w-3 h-3 mr-1" />}
                              {customer.segment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{customer.orders}</TableCell>
                          <TableCell className="text-right font-medium">${customer.totalSpent.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{customer.loyaltyPoints}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">VIP customers filtered view</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="regular">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Regular customers filtered view</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">New customers filtered view</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  return (
    <CartProvider>
      <CustomersPageContent />
    </CartProvider>
  )
}
