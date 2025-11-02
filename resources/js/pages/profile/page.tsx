"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Package, Heart, Settings, Edit, Save, X } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"
import { OrdersList } from "./order"

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

interface User {
  name: string
  email: string
  avatar?: string
  joinDate?: string
  totalOrders?: number
  totalSpent?: string | number
}
interface ProfilePageProps {
  orders?: Order[]
  auth?: {
    user: User
  }
}

// const mockOrders = [
//   {
//     id: "ORD-001",
//     date: "2024-01-15",
//     status: "delivered",
//     total: 299.99,
//     items: [{ name: "Elegant Silk Dress", quantity: 1, price: 299.99 }],
//   },
//   {
//     id: "ORD-002",
//     date: "2024-01-10",
//     status: "shipped",
//     total: 189.99,
//     items: [{ name: "Cashmere Sweater", quantity: 1, price: 189.99 }],
//   },
//   {
//     id: "ORD-003",
//     date: "2024-01-05",
//     status: "processing",
//     total: 449.98,
//     items: [
//       { name: "Premium Leather Handbag", quantity: 1, price: 349.99 },
//       { name: "Pearl Earrings", quantity: 1, price: 99.99 },
//     ],
//   },
// ]

const mockWishlist = [
  {
    id: 1,
    name: "Designer Wool Coat",
    price: 599.99,
    image: "/placeholder.svg",
    inStock: true,
  },
  {
    id: 2,
    name: "Silk Scarf Collection",
    price: 129.99,
    image: "/placeholder.svg",
    inStock: false,
  },
]

export default function ProfilePage({ orders = [] }: ProfilePageProps) {
  const { props } = usePage()
  const auth = props.auth as { user: User } | undefined
  const user = auth?.user
  
  const [isEditing, setIsEditing] = useState(false)
  // const [userInfo, setUserInfo] = useState({
  //   name: auth.user.name,
  //   email: auth.mockUser.email,
  //   phone: "+1 (555) 123-4567",
  //   address: "123 Fashion Ave, Style City, SC 12345",
  // })

  const handleSave = async () => {
    // TODO: Integrate with Laravel backend using Inertia
    // router.put('/api/user/profile', userInfo, {
    //   preserveState: true,
    //   preserveScroll: true,
    //   onSuccess: () => setIsEditing(false)
    // })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              ← Back to Shopping
            </Link>
          </Button>

          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || ""} />
              <AvatarFallback className="text-2xl font-serif">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-800">{user?.name || "User"}</h1>
              <p className="text-slate-600">Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : "N/A"}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>{user?.totalOrders || 0} orders</span>
                <span>${Number(user?.totalSpent || 0).toFixed(2)} total spent</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <OrdersList orders={orders} />
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockWishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                      <h3 className="font-medium mb-2">{item.name}</h3>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-rose-600">${item.price}</p>
                        <Badge variant={item.inStock ? "default" : "secondary"}>
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" disabled={!item.inStock} className="flex-1">
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userInfo.address}
                    onChange={(e) => setUserInfo((prev) => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-600">Receive updates about your orders</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-slate-600">Update your account password</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-600">Add extra security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-red-600">Delete Account</p>
                      <p className="text-sm text-slate-600">Permanently delete your account</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}
