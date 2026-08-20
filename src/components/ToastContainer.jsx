import { useToast } from '../context/ToastContext'
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react'

const styles = {
  success: {
    container: 'bg-gray-900 text-white',
    icon: <IconCheck size={16} className="text-green-400 shrink-0" />,
  },
  error: {
    container: 'bg-gray-900 text-white',
    icon: <IconX size={16} className="text-red-400 shrink-0" />,
  },
  info: {
    container: 'bg-gray-900 text-white',
    icon: <IconInfoCircle size={16} className="text-blue-400 shrink-0" />,
  },
}

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed z-50 flex flex-col gap-2
      bottom-24 left-4 right-4 items-center
      md:bottom-auto md:top-5 md:right-5 md:left-auto md:items-end"
    >
      {toasts.map(toast => {
        const style = styles[toast.type] || styles.success
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium w-full md:w-auto md:max-w-sm animate-fade-in ${style.container}`}
          >
            {style.icon}
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}