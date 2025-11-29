'use client'

import { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { FormError } from './form/form-error'
import { FormInput } from './form/form-input'
import { FormTextarea } from './form/form-textarea'
import { FormSelect } from './form/form-select'
import { FormBadgeSelect } from './form/form-badge-select'
import { FormImageUpload } from './form/form-image-upload'
import { FormFeatures } from './form/form-features'

interface ProductFormData {
  name: string
  price: string
  compare_price: string
  category_id: string
  brand_id: string
  description: string
  material: string
  care_instructions: string
  origin: string
  fit: string
  sizes: string[]
  colors: string[]
  features: string[]
  images: Array<{ file: File; is_primary: number }>
  is_active?: number
  track_stock?: number
}

const AVAILABLE_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const AVAILABLE_COLORS = ['Black', 'White', 'Navy', 'Burgundy', 'Cream', 'Camel', 'Charcoal', 'Beige', 'Gray', 'Brown']

interface CategoryItem {
  id: number | string
  name: string
}

interface BrandItem {
  id: number | string
  name: string
}

export function ProductUploadForm() {
  const page = usePage<{
    categories?: CategoryItem[]
    brands?: BrandItem[]
  }>()
  const form = useForm<ProductFormData>({
    name: '',
    price: '',
    compare_price: '',
    category_id: '',
    brand_id: '',
    description: '',
    material: '',
    care_instructions: '',
    origin: '',
    fit: '',
    sizes: [],
    colors: [],
    features: [],
    images: [],
    is_active: 1,
    track_stock: 1,
  })

  const [currentFeature, setCurrentFeature] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const categories = page.props.categories || []
  const brands = page.props.brands || []

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    form.setData(field as any, value)
    // Clear error for this field when user starts typing
    form.clearErrors(field as any)
  }

  const handleSizeToggle = (size: string) => {
    const next = form.data.sizes.includes(size) ? form.data.sizes.filter((s) => s !== size) : [...form.data.sizes, size]
    form.setData('sizes', next)
    form.clearErrors('sizes')
  }

  const handleColorToggle = (color: string) => {
    const next = form.data.colors.includes(color) ? form.data.colors.filter((c) => c !== color) : [...form.data.colors, color]
    form.setData('colors', next)
    form.clearErrors('colors')
  }

  const handleAddFeature = () => {
    if (currentFeature.trim()) {
      form.setData('features', [...form.data.features, currentFeature.trim()])
      setCurrentFeature('')
      form.clearErrors('features')
    }
  }

  const handleRemoveFeature = (index: number) => {
    form.setData('features', form.data.features.filter((_, i) => i !== index))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const nextImages = [...form.data.images]
    files.forEach((file, i) => {
      const isPrimary = nextImages.length === 0 && i === 0 ? 1 : 0
      nextImages.push({ file, is_primary: isPrimary })

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    form.setData('images', nextImages)
    form.clearErrors('images')
  }

  const handleRemoveImage = (index: number) => {
    form.setData('images', form.data.images.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    form.post('/admin/products', {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        setSubmitSuccess(true)
        form.reset()
        setImagePreviews([])
        setCurrentFeature('')
        setTimeout(() => setSubmitSuccess(false), 3000)
      },
      onError: (pageErrors: any) => {
       
        if (!pageErrors || typeof pageErrors !== 'object') {
          setGeneralError('An error occurred while submitting the form.')
        }
      },
      onFinish: () => {
        // nothing needed; processing state is in `form.processing`
      },
    })
  }

  const categoryOptions = categories.map((cat) => ({
    value: String(cat.id),
    label: cat.name,
  }))

  const brandOptions = brands.map((brand) => ({
    value: String(brand.id),
    label: brand.name,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global errors */}
      {generalError && <FormError message={generalError} />}
      {submitSuccess && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Product created successfully!</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              id="name"
              label="Product Name"
              value={form.data.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="e.g., Elegant Silk Midi Dress"
              error={form.errors.name}
            />

            {/* <FormInput
              id="brand"
              label="Brand"
              value={form.data.brand_id}
              onChange={(value) => handleInputChange('brand_id', value)}
              placeholder="e.g., Luxe Fashion"
              error={form.errors.brand_id}
            /> */}

             <FormSelect
              id="brand"
              label="Brand"
              value={form.data.brand_id}
              onValueChange={(value) => handleInputChange('brand_id', value)}
              options={brandOptions}
              placeholder="Select brand"
              error={form.errors.brand_id}
            />
          </div>

          <FormTextarea
            id="description"
            label="Description"
            value={form.data.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Detailed product description..."
            rows={4}
            error={form.errors.description}
          />
        </CardContent>
      </Card>

      {/* Pricing & Category */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <FormInput
              id="price"
              label="Price ($)"
              type="number"
              step="0.01"
              value={form.data.price}
              onChange={(value) => handleInputChange('price', value)}
              placeholder="299.99"
              error={form.errors.price}
            />

            <FormInput
              id="compare_price"
              label="Original Price ($)"
              type="number"
              step="0.01"
              value={form.data.compare_price}
              onChange={(value) => handleInputChange('compare_price', value)}
              placeholder="399.99"
              error={form.errors.compare_price}
            />

            <FormSelect
              id="category"
              label="Category"
              value={form.data.category_id}
              onValueChange={(value) => handleInputChange('category_id', value)}
              options={categoryOptions}
              placeholder="Select category"
              error={form.errors.category_id}
            />
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              id="material"
              label="Material"
              value={form.data.material}
              onChange={(value) => handleInputChange('material', value)}
              placeholder="e.g., 100% Mulberry Silk"
              error={form.errors.material}
            />

            <FormInput
              id="origin"
              label="Origin"
              value={form.data.origin}
              onChange={(value) => handleInputChange('origin', value)}
              placeholder="e.g., Made in Italy"
              error={form.errors.origin}
            />

            <FormInput
              id="fit"
              label="Fit"
              value={form.data.fit}
              onChange={(value) => handleInputChange('fit', value)}
              placeholder="e.g., True to size"
              error={form.errors.fit}
            />

            <FormInput
              id="care_instructions"
              label="Care Instructions"
              value={form.data.care_instructions}
              onChange={(value) => handleInputChange('care_instructions', value)}
              placeholder="e.g., Dry clean only"
              error={form.errors.care_instructions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sizes & Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Sizes & Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormBadgeSelect
            label="Available Sizes"
            items={AVAILABLE_SIZES}
            selected={form.data.sizes}
            onToggle={handleSizeToggle}
            error={form.errors.sizes}
          />

          <FormBadgeSelect
            label="Available Colors"
            items={AVAILABLE_COLORS}
            selected={form.data.colors}
            onToggle={handleColorToggle}
            error={form.errors.colors}
          />
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFeatures
            features={form.data.features}
            currentFeature={currentFeature}
            onCurrentFeatureChange={setCurrentFeature}
            onAddFeature={handleAddFeature}
            onRemoveFeature={handleRemoveFeature}
            error={form.errors.features}
          />
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <FormImageUpload
            images={form.data.images}
            previews={imagePreviews}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            error={form.errors.images}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset()
            setImagePreviews([])
            form.clearErrors()
            setGeneralError(null)
          }}
        >
          Clear Form
        </Button>
        <Button type="submit" disabled={form.processing}>
          {form.processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            'Upload Product'
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProductUploadForm
