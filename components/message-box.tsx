import React from 'react'
import { Button } from '@/components/ui/button'
import { ModernCard } from '@/components/modern-card'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export interface MessageBoxProps {
  isOpen: boolean
  type: 'confirm' | 'alert' | 'success' | 'error' | 'info'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}

export function MessageBox({
  isOpen,
  type,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose
}: MessageBoxProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-400" />
      case 'confirm':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-400" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />
    }
  }

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'confirm':
        return 'text-yellow-400'
      case 'info':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
      case 'error':
      case 'confirm':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
    }
  }

  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <ModernCard className="w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <CardTitle className={`${getHeaderColor()} text-lg`}>
                {title}
              </CardTitle>
            </div>
            {(type === 'alert' || type === 'success' || type === 'error' || type === 'info') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex space-x-3">
            {type === 'confirm' ? (
              <>
                <Button
                  onClick={handleConfirm}
                  className={`flex-1 ${getConfirmButtonStyle()}`}
                >
                  {confirmText}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {cancelText}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCancel}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
              >
                OK
              </Button>
            )}
          </div>
        </CardContent>
      </ModernCard>
    </div>
  )
}
