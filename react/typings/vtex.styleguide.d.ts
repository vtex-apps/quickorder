declare module 'vtex.styleguide' {
  import { ComponentType } from 'react'

  export const Input: ComponentType<InputProps>
  export const Button: ComponentType<InputProps>
  export const ToastContext: Context<{ showToast: any }>
  export const IconClear: ComponentType<InputProps>
  export const Tag: ComponentType<InputProps>
  export const Table: ComponentType<InputProps>
  export const ButtonWithIcon: ComponentType<InputProps>
  export const IconDelete: ComponentType<InputProps>
  export const IconInfo: ComponentType<InputProps>
  export const Tooltip: ComponentType<InputProps>
  export const Spinner: ComponentType<InputProps>
  export const Textarea: ComponentType<InputProps>
  export const Dropzone: ComponentType<InputProps>
  export const AutocompleteInput: ComponentType<InputProps>

  interface InputProps {
    [key: string]: any
  }
}
