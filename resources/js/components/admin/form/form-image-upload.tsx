import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { X, Upload } from 'lucide-react'
import { FormError } from './form-error'

interface FormImageUploadProps {
  images: Array<{ file: File; is_primary: number }> | File[]
  previews: string[]
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  error?: string | string[]
}

export function FormImageUpload({
  images,
  previews,
  onImageUpload,
  onRemoveImage,
  error,
}: FormImageUploadProps) {
  return (
    <div className="space-y-4">
      <Label>Product Images</Label>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label
            htmlFor="images"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Images
          </Label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
          />
          <span className="text-sm text-muted-foreground">{images.length} image(s) selected</span>
        </div>

        {error && <FormError message={error} />}

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className="relative group">
                <img
                  src={preview || '/placeholder.svg'}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
