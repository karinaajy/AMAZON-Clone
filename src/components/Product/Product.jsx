import React from "react";
import "./Product.css";
import { useAmazonStore } from "../../store";

function Product({ id, title, image, price, rating }) {
  const addToBasket = useAmazonStore((state) => state.addToBasket);

  const handleAddToBasket = () => {
    // Add item to basket using Zustand
    addToBasket({
      id,
      title,
      image,
      price,
      rating,
    });
  };

  return (
    <div className='product'>
      <div className='product__info'>
        <p>{title}</p>
        <p className='product__price'>
          <small>$</small>
          <strong>{price}</strong>
        </p>
        <div className='product__rating'>
          {Array(rating)
            .fill()
            .map((_, i) => (
              <p key={i}>🌟</p>
            ))}
        </div>
      </div>

      <img src={image} alt='' />

      <button onClick={handleAddToBasket}>Add to Basket</button>
    </div>
  )
}

export default Product
