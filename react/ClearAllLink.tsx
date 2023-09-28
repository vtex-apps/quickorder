import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { Button } from 'vtex.styleguide'

interface Props {
  removeItems: () => void
}

const ClearAllLink: React.FC<Props> = ({ removeItems }) => {
  const CSS_HANDLES = ['clearOrderList'] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={`${handles.clearOrderList}`}>
      <Button variation="tertiary" onClick={removeItems}>
        Clear Quick Order List
      </Button>
    </div>
  )
}

export default ClearAllLink
