import React from 'react'
import { Button } from 'vtex.styleguide'

interface Props {
  addRow: () => void
}

const AddMoreLinesButton: React.FC<Props> = ({ addRow }) => {
  return (
    <div>
      <Button onClick={addRow}>+ Add More Lines</Button>
    </div>
  )
}

export default AddMoreLinesButton
