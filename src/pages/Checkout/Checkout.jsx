import React from "react";
import "./Checkout.css";
import Subtotal from "../../components/Subtotal";
import CheckoutProduct from "../../components/CheckoutProduct";
import { useAmazonStore } from "../../store";

function Checkout() {
  const basket = useAmazonStore((state) => state.basket);
  const user = useAmazonStore((state) => state.user);

  return (
    <div className="checkout">
      <div className="checkout__left">
        <img
          className="checkout__ad"
          src="https://images-na.ssl-images-amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg"
          alt="Amazon Advertisement"
        />

        <div>
          <h3>Hello, {user?.email || 'Guest'}</h3>
          <h2 className="checkout__title">Your shopping Basket</h2>

          {basket?.length === 0 ? (
            <div className="checkout__empty">
              <h3>Your basket is empty</h3>
              <p>You have no items in your basket. To buy one or more items, click "Add to basket" next to the item.</p>
            </div>
          ) : (
            basket?.map((item, index) => (
              <CheckoutProduct
                key={`${item.id}-${index}`}
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))
          )}
        </div>
      </div>

      <div className="checkout__right">
        <Subtotal />
      </div>
    </div>
  );
}

export default Checkout;
