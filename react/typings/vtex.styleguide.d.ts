declare module 'vtex.styleguide' {
  import { ComponentType } from 'react'

  export const Input: ComponentType<InputProps>
  export const Button: ComponentType<InputProps>
  export const ToastContext: Context<{ showToast: any }>
  export const IconClear: ComponentType<InputProps>
  export const Tag: ComponentType<InputProps>

  interface InputProps {
    [key: string]: any
  }
}
