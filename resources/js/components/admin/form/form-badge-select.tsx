import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { FormError } from './form-error'

interface FormBadgeSelectProps {
  label: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  error?: string | string[]
}

export function FormBadgeSelect({ label, items, selected, onToggle, error }: FormBadgeSelectProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item}
            variant={selected.includes(item) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => onToggle(item)}
          >
            {item}
          </Badge>
        ))}
      </div>
      {error && <FormError message={error} />}
    </div>
  )
}
