"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, DollarSign, TrendingUp, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { TopProductsTable } from "@/components/admin/top-products-table"

// Mock dashboard data
const dashboardData = {
  totalRevenue: 45231.89,
  revenueChange: 20.1,
  totalOrders: 1234,
  ordersChange: 15.3,
  totalCustomers: 5678,
  customersChange: -2.5,
  avgOrderValue: 36.63,
  avgOrderChange: 12.4,
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{dashboardData.revenueChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalOrders.toLocaleString()}</div>
                <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{dashboardData.ordersChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalCustomers.toLocaleString()}</div>
                <p className="text-xs flex items-center gap-1 text-red-600 mt-1">
                  <ArrowDownRight className="w-3 h-3" />
                  {dashboardData.customersChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.avgOrderValue}</div>
                <p className="text-xs flex items-center gap-1 text-green-600 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{dashboardData.avgOrderChange}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <TopProductsTable />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
