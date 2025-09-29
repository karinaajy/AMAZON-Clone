import React from 'react';
import './Order.css';
import { format, fromUnixTime } from 'date-fns';
import CheckoutProduct from '../../../../../amazon-clone(1)/amazon-clone/amazon-clone-modern/src/components/CheckoutProduct';
import { NumericFormat } from 'react-number-format';

function Order({ order }) {
  if (!order || !order.data) {
    return null;
  }

  const { data, id } = order;
  const { basket, amount, created } = data;

  // 格式化时间戳
  const formatOrderDate = (timestamp) => {
    try {
      // 如果是秒级时间戳，转换为毫秒
      const date = typeof timestamp === 'number' 
        ? fromUnixTime(timestamp) 
        : new Date(timestamp);
      
      return format(date, 'MMMM do yyyy, h:mma');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className='order'>
      <h2>Order</h2>
      <p className='order__date'>{formatOrderDate(created)}</p>
      <p className="order__id">
        <small>{id}</small>
      </p>
      
      <div className='order__items'>
        {basket?.map((item, index) => (
          <CheckoutProduct
            key={`${item.id}-${index}`}
            id={item.id}
            title={item.title}
            image={item.image}
            price={item.price}
            rating={item.rating}
            hideButton={true}
          />
        ))}
      </div>

      <NumericFormat
        renderText={(value) => (
          <h3 className="order__total">Order Total: {value}</h3>
        )}
        decimalScale={2}
        value={amount / 100} // Stripe stores amounts in cents
        displayType={"text"}
        thousandSeparator={true}
        prefix={"$"}
      />
    </div>
  );
}

export default Order;
