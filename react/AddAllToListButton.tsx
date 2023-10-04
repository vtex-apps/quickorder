import React from 'react'
import { Button } from 'vtex.styleguide'
// import styles from './global.css'
import { useCssHandles } from 'vtex.css-handles'

const AddAllToListButton = () => {

  const CSS_HANDLES = ['addAllToList'] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={`${handles.addAllToList}`}>
      <Button>Add All To List</Button>
    </div>
  )
}

export default AddAllToListButton
