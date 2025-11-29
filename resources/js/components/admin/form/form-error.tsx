import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  message?: string | string[]
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  const messages = Array.isArray(message) ? message : [message]

  return (
    <div className="rounded-md bg-red-50 p-3 border border-red-200">
      <div className="flex gap-2">
        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-600">
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
