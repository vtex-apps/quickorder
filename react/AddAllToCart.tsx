import React from 'react';
import { Button } from 'vtex.styleguide';
import styles from './global.css'


const AddAllToCart = () => {
    return (
        <div>
            <Button className={styles.addAllButton}> ADD ALL TO CART</Button>
        </div>
    );
};

export default AddAllToCart;