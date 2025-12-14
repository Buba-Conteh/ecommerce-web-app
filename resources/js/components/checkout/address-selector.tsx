"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MapPin, Plus } from "lucide-react"

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

interface AddressSelectorProps {
  addresses: Address[]
  selectedAddressId?: number | null
  onSelect: (addressId: number | null) => void
  onAddNew: () => void
  type: "shipping" | "billing"
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
  type,
}: AddressSelectorProps) {
  const [useNewAddress, setUseNewAddress] = useState(!selectedAddressId)

  const handleChange = (value: string) => {
    if (value === "new") {
      setUseNewAddress(true)
      onSelect(null)
    } else {
      setUseNewAddress(false)
      onSelect(parseInt(value))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {type === "shipping" ? "Shipping Address" : "Billing Address"}
        </CardTitle>
        <CardDescription>
          {type === "shipping"
            ? "Where should we deliver your order?"
            : "Where should we send the invoice?"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={useNewAddress ? "new" : selectedAddressId?.toString() || ""}
          onValueChange={handleChange}
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
              <Label
                htmlFor={`address-${address.id}`}
                className="flex-1 cursor-pointer space-y-1"
              >
                <div className="font-medium">
                  {address.first_name} {address.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {address.address_line_1}
                  {address.address_line_2 && `, ${address.address_line_2}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {address.city}, {address.state} {address.postal_code}
                </div>
                <div className="text-sm text-muted-foreground">{address.country}</div>
                {address.is_default && (
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </Label>
            </div>
          ))}

          <div
            className="flex items-center space-x-3 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => {
              setUseNewAddress(true)
              onSelect(null)
            }}
          >
            <RadioGroupItem value="new" id="new-address" />
            <Label htmlFor="new-address" className="flex-1 cursor-pointer flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add new address</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

