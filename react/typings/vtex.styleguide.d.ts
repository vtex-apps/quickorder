/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'vtex.styleguide' {
  import type { ComponentType } from 'react'

  export const Input: ComponentType<InputProps>

  interface InputProps {
    [key: string]: any
  }

  export const Button
  export const Dropzone
  export const ToastContext
  export const Spinner
  export const Textarea
  export const Table
  export const ButtonWithIcon
  export const IconDelete
  export const IconInfo
  export const Tooltip
  export const Dropdown
  export const AutocompleteInput
  export const IconClear
  export const Tag
  export const Collapsible
  export const Alert
}
