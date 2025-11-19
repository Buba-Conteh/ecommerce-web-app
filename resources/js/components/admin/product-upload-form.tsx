"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { X, Upload, Plus, Check } from "lucide-react"

interface ProductFormData {
  name: string
  price: string
  originalPrice: string
  category: string
  brand: string
  description: string
  material: string
  careInstructions: string
  origin: string
  fit: string
  sizes: string[]
  colors: string[]
  features: string[]
  images: File[]
}

const CATEGORIES = ["dresses", "sweaters", "accessories", "jewelry", "outerwear", "pants", "shoes", "bags"]
const AVAILABLE_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
const AVAILABLE_COLORS = ["Black", "White", "Navy", "Burgundy", "Cream", "Camel", "Charcoal", "Beige", "Gray", "Brown"]

export function ProductUploadForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    brand: "",
    description: "",
    material: "",
    careInstructions: "",
    origin: "",
    fit: "",
    sizes: [],
    colors: [],
    features: [],
    images: [],
  })

  const [currentFeature, setCurrentFeature] = useState("")
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }))
  }

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
    }))
  }

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }))
      setCurrentFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }))

      // Create preview URLs
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual Laravel API call
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("price", formData.price)
      submitData.append("original_price", formData.originalPrice)
      submitData.append("category", formData.category)
      submitData.append("brand", formData.brand)
      submitData.append("description", formData.description)
      submitData.append("material", formData.material)
      submitData.append("care_instructions", formData.careInstructions)
      submitData.append("origin", formData.origin)
      submitData.append("fit", formData.fit)
      submitData.append("sizes", JSON.stringify(formData.sizes))
      submitData.append("colors", JSON.stringify(formData.colors))
      submitData.append("features", JSON.stringify(formData.features))

      formData.images.forEach((image, index) => {
        submitData.append(`images[${index}]`, image)
      })

      // TODO: Send to Laravel backend
      // const response = await fetch('/api/admin/products', {
      //   method: 'POST',
      //   body: submitData,
      // })
      // const result = await response.json()

      console.log("[v0] Product upload data:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        // Reset form
        setFormData({
          name: "",
          price: "",
          originalPrice: "",
          category: "",
          brand: "",
          description: "",
          material: "",
          careInstructions: "",
          origin: "",
          fit: "",
          sizes: [],
          colors: [],
          features: [],
          images: [],
        })
        setImagePreviews([])
      }, 2000)
    } catch (error) {
      console.error("Failed to upload product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Elegant Silk Midi Dress"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand *</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
              placeholder="e.g., Luxe Fashion"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="299.99"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price ($)</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange("originalPrice", e.target.value)}
              placeholder="399.99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Detailed product description..."
            rows={4}
            required
          />
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Product Images</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Label
              htmlFor="images"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Images
            </Label>
            <Input id="images" type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            <span className="text-sm text-muted-foreground">{formData.images.length} image(s) selected</span>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <Card key={index} className="relative group">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Specifications</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              value={formData.material}
              onChange={(e) => handleInputChange("material", e.target.value)}
              placeholder="e.g., 100% Mulberry Silk"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange("origin", e.target.value)}
              placeholder="e.g., Made in Italy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fit">Fit</Label>
            <Input
              id="fit"
              value={formData.fit}
              onChange={(e) => handleInputChange("fit", e.target.value)}
              placeholder="e.g., True to size"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="careInstructions">Care Instructions</Label>
            <Input
              id="careInstructions"
              value={formData.careInstructions}
              onChange={(e) => handleInputChange("careInstructions", e.target.value)}
              placeholder="e.g., Dry clean only"
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Available Sizes *</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => (
            <Badge
              key={size}
              variant={formData.sizes.includes(size) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleSizeToggle(size)}
            >
              {size}
            </Badge>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Available Colors *</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COLORS.map((color) => (
            <Badge
              key={color}
              variant={formData.colors.includes(color) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleColorToggle(color)}
            >
              {color}
            </Badge>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Key Features</h3>

        <div className="flex gap-2">
          <Input
            value={currentFeature}
            onChange={(e) => setCurrentFeature(e.target.value)}
            placeholder="Add a feature..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
          />
          <Button type="button" onClick={handleAddFeature}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.features.length > 0 && (
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary p-3 rounded-md">
                <span className="text-sm">{feature}</span>
                <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveFeature(index)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              name: "",
              price: "",
              originalPrice: "",
              category: "",
              brand: "",
              description: "",
              material: "",
              careInstructions: "",
              origin: "",
              fit: "",
              sizes: [],
              colors: [],
              features: [],
              images: [],
            })
            setImagePreviews([])
          }}
        >
          Clear Form
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.name ||
            !formData.price ||
            !formData.category ||
            formData.sizes.length === 0 ||
            formData.colors.length === 0
          }
          className={submitSuccess ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : submitSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Product Uploaded!
            </>
          ) : (
            "Upload Product"
          )}
        </Button>
      </div>
    </form>
  )
}
