import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from './form-error'

interface FormInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  step?: string
  error?: string | string[]
}

export function FormInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  error,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'border-red-500' : ''}
      />
      {error && <FormError message={error} />}
    </div>
  )
}
