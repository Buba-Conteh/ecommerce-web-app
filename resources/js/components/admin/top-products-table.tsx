"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const topProducts = [
  { id: 1, name: "Silk Midi Dress", sales: 342, revenue: 102300, trend: "up" },
  { id: 2, name: "Cashmere Sweater", sales: 289, revenue: 54621, trend: "up" },
  { id: 3, name: "Leather Handbag", sales: 234, revenue: 105066, trend: "down" },
  { id: 4, name: "Pearl Earrings", sales: 198, revenue: 23760, trend: "up" },
  { id: 5, name: "Wool Coat", sales: 156, revenue: 93600, trend: "up" },
]

export function TopProductsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Sales</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="text-right">{product.sales}</TableCell>
            <TableCell className="text-right">${product.revenue.toLocaleString()}</TableCell>
            <TableCell className="text-right">
              <Badge variant={product.trend === "up" ? "default" : "secondary"}>
                {product.trend === "up" ? "↑" : "↓"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
