import React from 'react'
import CopyPastePad from './CopyPastePad';
import QuickOrderPad from './QuickOrderPad';
import { useCssHandles } from 'vtex.css-handles'
import './global.css'

function QuickOrderWrapper() {
  const CSS_HANDLES = [
    'wrapperContainer'
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={handles.wrapperContainer}>
      <QuickOrderPad />
      <CopyPastePad />
    </div>
  )
}

export default QuickOrderWrapper
