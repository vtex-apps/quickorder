import React from 'react';
import { useCssHandles } from 'vtex.css-handles';
import { Button } from 'vtex.styleguide';
import './global.css'


const AddAllToCart = () => {
    const CSS_HANDLES = [
        'addAllToCartContainer',
        'addAllToCartButton'
    ] as const

    const handles = useCssHandles(CSS_HANDLES)

    return (
        <div>
            <Button variation="primary"> ADD ALL TO CART</Button>
        </div>
    );
};

export default AddAllToCart;