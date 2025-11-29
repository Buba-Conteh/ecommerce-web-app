import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FormError } from './form-error'

interface FormTextareaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  error?: string | string[]
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={error ? 'border-red-500' : ''}
      />
      {error && <FormError message={error} />}
    </div>
  )
}
