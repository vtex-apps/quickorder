import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { Button } from 'vtex.styleguide'
import './global.css'

interface AddAllToCart {
  onClick: () => void;
  isLoading: boolean;
}

const AddAllToCart: React.FC<AddAllToCart> = ({ onClick }) => {
  const CSS_HANDLES = ['addAllToCartContainer', 'addAllToCartButton'] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={handles.addAllToCartContainer}>
      <Button isLoading={false} onClick={onClick} variation="primary"> ADD ALL TO CART</Button>
    </div>
  )
}

export default AddAllToCart
