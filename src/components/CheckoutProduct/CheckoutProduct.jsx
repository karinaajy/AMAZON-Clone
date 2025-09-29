import React from 'react';
import './CheckoutProduct.css';
import { useAmazonStore } from '../../store';

function CheckoutProduct({ id, image, title, price, rating, hideButton }) {
  const removeFromBasket = useAmazonStore((state) => state.removeFromBasket);

  const handleRemoveFromBasket = () => {
    // remove the item from the basket
    removeFromBasket(id);
  };

  return (
    <div className='checkoutProduct'>
      <img className='checkoutProduct__image' src={image} alt={title} />

      <div className='checkoutProduct__info'>
        <p className='checkoutProduct__title'>{title}</p>
        <p className="checkoutProduct__price">
          <small>$</small>
          <strong>{price}</strong>
        </p>
        <div className="checkoutProduct__rating">
          {Array(rating)
            .fill()
            .map((_, i) => (
              <p key={i}>🌟</p>
            ))}
        </div>
        {!hideButton && (
          <button onClick={handleRemoveFromBasket}>Remove from Basket</button>
        )}
      </div>
    </div>
  );
}

export default CheckoutProduct;
