import { ref, reactive } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${++toastIdCounter}`
    const newToast: Toast = {
      id,
      duration: 5000, // 5 seconds default
      ...toast
    }

    toasts.value.push(newToast)

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAllToasts() {
    toasts.value = []
  }

  // Convenience methods
  function success(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  function error(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    })
  }

  function warning(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  function info(title: string, message?: string, options?: Partial<Toast>) {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  return {
    toasts: toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}