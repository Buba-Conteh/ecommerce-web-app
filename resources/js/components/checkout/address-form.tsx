"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface AddressFormProps {
  formData: AddressFormData
  onChange: (field: keyof AddressFormData, value: string) => void
  errors?: Partial<Record<keyof AddressFormData, string>>
}

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "ES", label: "Spain" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
]

export function AddressForm({ formData, onChange, errors = {} }: AddressFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              className={errors.first_name ? "border-destructive" : ""}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onChange("last_name", e.target.value)}
              className={errors.last_name ? "border-destructive" : ""}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address_line_1">
            Address Line 1 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address_line_1"
            value={formData.address_line_1}
            onChange={(e) => onChange("address_line_1", e.target.value)}
            placeholder="123 Main Street"
            className={errors.address_line_1 ? "border-destructive" : ""}
          />
          {errors.address_line_1 && (
            <p className="text-sm text-destructive mt-1">{errors.address_line_1}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
          <Input
            id="address_line_2"
            value={formData.address_line_2 || ""}
            onChange={(e) => onChange("address_line_2", e.target.value)}
            placeholder="Apartment, suite, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">
              State/Province <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => onChange("state", e.target.value)}
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && (
              <p className="text-sm text-destructive mt-1">{errors.state}</p>
            )}
          </div>
          <div>
            <Label htmlFor="postal_code">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => onChange("postal_code", e.target.value)}
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && (
              <p className="text-sm text-destructive mt-1">{errors.postal_code}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => onChange("country", value)}
            >
              <SelectTrigger id="country" className={errors.country ? "border-destructive" : ""}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive mt-1">{errors.country}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

