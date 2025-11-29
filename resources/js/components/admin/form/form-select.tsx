import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormError } from './form-error'

interface FormSelectProps {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  error?: string | string[]
}

export function FormSelect({
  id,
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error,
}: FormSelectProps) {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={`w-full ${error ? 'border-red-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FormError message={error} />}
    </div>
  )
}
