import React from "react";
import "./Subtotal.css";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";
import { useAmazonStore } from "../../store";

function Subtotal() {
  const navigate = useNavigate();
  const basket = useAmazonStore((state) => state.basket);
  const getBasketTotal = useAmazonStore((state) => state.getBasketTotal);

  const handleProceedToCheckout = () => {
    // Navigate to payment page
    navigate('/payment');
  };

  return (
    <div className="subtotal">
      <NumericFormat
        renderText={(value) => (
          <>
            <p>
              Subtotal ({basket?.length || 0} items): <strong>{value}</strong>
            </p>
            <small className="subtotal__gift">
              <input type="checkbox" /> This order contains a gift
            </small>
          </>
        )}
        decimalScale={2}
        value={getBasketTotal()}
        displayType={"text"}
        thousandSeparator={true}
        prefix={"$"}
      />

      <button onClick={handleProceedToCheckout}>Proceed to Checkout</button>
    </div>
  );
}

export default Subtotal;
