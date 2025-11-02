"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { CartProvider } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Upload, Save } from "lucide-react"
import { router } from "@inertiajs/react"

interface Category {
  id: number
  name: string
}

interface Brand {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

interface ProductImage {
  id?: number
  url?: string
  file?: File
  is_primary: boolean
  preview?: string
}

interface AdminProductsProps {
  categories?: Category[]
  brands?: Brand[]
  tags?: Tag[]
}

function AdminProductsContent({ categories = [], brands = [], tags = [] }: AdminProductsProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    compare_price: "",
    sku: "",
    stock_quantity: "",
    track_stock: true,
    is_featured: false,
    category_id: "",
    brand_id: "",
    tags: [] as number[],
  })
  
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: ProductImage[] = []
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newImage: ProductImage = {
          file,
          is_primary: newImages.length === 0 && images.length === 0,
          preview: reader.result as string
        }
        setImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      // Set first image as primary if none exists
      if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
        newImages[0].is_primary = true
      }
      return newImages
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({ ...img, is_primary: i === index })))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Create FormData for file upload
    const submitData = new FormData()
    
    // Add basic fields
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData]
      if (key === 'tags') {
        // Handle tags array
        const tagsArray = value as number[]
        tagsArray.forEach(tagId => {
          submitData.append('tags[]', tagId.toString())
        })
      } else if (value !== null && value !== undefined && value !== '') {
        submitData.append(key, value.toString())
      }
    })

    // Add images
    images.forEach((image, index) => {
      if (image.file) {
        submitData.append(`images[${index}][file]`, image.file)
        submitData.append(`images[${index}][is_primary]`, image.is_primary ? '1' : '0')
      }
    })

    router.post('/api/admin/products', submitData, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setSuccess('Product created successfully!')
        setLoading(false)
        
        // Reset form
        setFormData({
          name: "",
          description: "",
          short_description: "",
          price: "",
          compare_price: "",
          sku: "",
          stock_quantity: "",
          track_stock: true,
          is_featured: false,
          category_id: "",
          brand_id: "",
          tags: [],
        })
        setImages([])
      },
      onError: (errors) => {
        setError(Object.values(errors).flat().join(', ') || 'Failed to create product')
        setLoading(false)
      },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Product</h1>
            <p className="text-muted-foreground">Create and manage your products</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="short_description">Short Description</Label>
                    <Textarea
                      id="short_description"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      placeholder="Brief description for listings"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Detailed product description"
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="compare_price">Compare Price</Label>
                      <Input
                        id="compare_price"
                        name="compare_price"
                        type="number"
                        step="0.01"
                        value={formData.compare_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Product SKU"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="track_stock"
                      checked={formData.track_stock}
                      onChange={(e) => handleCheckboxChange('track_stock', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="track_stock">Track inventory</Label>
                  </div>

                  {formData.track_stock && (
                    <div>
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        name="stock_quantity"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="images">Upload Images</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload one or more product images. The first image will be set as primary.
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-border">
                            <img
                              src={image.preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {image.is_primary && (
                            <Badge className="absolute top-2 left-2">Primary</Badge>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!image.is_primary && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(index)}
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Categories & Brand */}
              <Card>
                <CardHeader>
                  <CardTitle>Category & Brand</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger id="category_id" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand_id">Brand</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value }))}
                    >
                      <SelectTrigger id="brand_id" className="w-full">
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Select
                      onValueChange={(value) => {
                        const tagId = parseInt(value)
                        if (!formData.tags.includes(tagId)) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tagId] }))
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add tags" />
                      </SelectTrigger>
                      <SelectContent>
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id.toString()}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId)
                          return (
                            <Badge
                              key={tagId}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagId) }))}
                            >
                              {tag?.name} ×
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => handleCheckboxChange('is_featured', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_featured">Feature this product</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: "",
                      description: "",
                      short_description: "",
                      price: "",
                      compare_price: "",
                      sku: "",
                      stock_quantity: "",
                      track_stock: true,
                      is_featured: false,
                      category_id: "",
                      brand_id: "",
                      tags: [],
                    })
                    setImages([])
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts(props: AdminProductsProps) {
  return (
    <CartProvider>
      <AdminProductsContent {...props} />
    </CartProvider>
  )
}
