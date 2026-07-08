import { IconAlertCircle } from '@tabler/icons-react'

export default function ErrorMessage({ message = 'Algo salió mal. Intenta de nuevo.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <IconAlertCircle size={36} className="text-red-400" />
      <p className="text-sm text-gray-500 text-center max-w-xs">{message}</p>
    </div>
  )
}