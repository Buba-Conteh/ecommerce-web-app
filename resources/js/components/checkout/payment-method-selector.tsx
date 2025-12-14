"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, Lock } from "lucide-react"

type PaymentMethod = "stripe" | "paypal"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onSelect: (method: PaymentMethod) => void
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Your payment information is secure and encrypted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={(value) => onSelect(value as PaymentMethod)}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent/50 hover:border-primary/50">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Credit / Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="w-10 h-6 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      MC
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent/50 hover:border-primary/50">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Pay securely with your PayPal account</p>
                  </div>
                  <div className="w-16 h-10 bg-[#0070BA] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PayPal</span>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

