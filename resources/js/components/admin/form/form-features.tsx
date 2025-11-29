import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { FormError } from './form-error'

interface FormFeaturesProps {
  features: string[]
  currentFeature: string
  onCurrentFeatureChange: (value: string) => void
  onAddFeature: () => void
  onRemoveFeature: (index: number) => void
  error?: string | string[]
}

export function FormFeatures({
  features,
  currentFeature,
  onCurrentFeatureChange,
  onAddFeature,
  onRemoveFeature,
  error,
}: FormFeaturesProps) {
  return (
    <div className="space-y-4">
      <Label>Key Features</Label>

      <div className="flex gap-2">
        <Input
          value={currentFeature}
          onChange={(e) => onCurrentFeatureChange(e.target.value)}
          placeholder="Add a feature..."
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddFeature())}
        />
        <Button type="button" onClick={onAddFeature}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {error && <FormError message={error} />}

      {features.length > 0 && (
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between bg-secondary p-3 rounded-md">
              <span className="text-sm">{feature}</span>
              <Button type="button" size="icon" variant="ghost" onClick={() => onRemoveFeature(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
